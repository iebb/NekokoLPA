package im.nfc.ccid

import android.hardware.usb.UsbDeviceConnection
import android.hardware.usb.UsbEndpoint
import android.util.Log

class Ccid(
    val usbDeviceConnection: UsbDeviceConnection, val bulkIn: UsbEndpoint, val bulkOut: UsbEndpoint
) {
    private var currentSeq = 0.toByte()

    fun iccPowerOn(voltage: Byte = 0): ByteArray {
        val seq = currentSeq++
        val command = byteArrayOf(
            MESSAGE_TYPE_PC_TO_RDR_ICCPOWERON,
            0x00, 0x00, 0x00, 0x00,
            0x00,
            seq,
            voltage, // Auto voltage selection
            0x00, 0x00
        )
        sendCcidPcToRdrMessage(command)
        val response = receiveCcidRdrToPcMessage(seq)
        return response.data
    }

    fun iccPowerOff() {
        val seq = currentSeq++
        val command = byteArrayOf(
            MESSAGE_TYPE_PC_TO_RDR_ICCPOWEROFF,
            0x00, 0x00, 0x00, 0x00,
            0x00,
            seq,
            0x00,
            0x00, 0x00
        )
        sendCcidPcToRdrMessage(command)
    }

    fun xfrBlock(apdu: ByteArray): ByteArray {
        val seq = currentSeq++
        val command = byteArrayOf(
            MESSAGE_TYPE_PC_TO_RDR_XFRBLOCK,
            apdu.size.toByte(),
            (apdu.size shr 8).toByte(),
            (apdu.size shr 16).toByte(),
            (apdu.size shr 24).toByte(),
            0x00,
            seq,
            0x00,
            0x00,
            0x00
        )
        val data = command + apdu

        var bytesSent = 0
        while (bytesSent < data.size) {
            val chunkSize = minOf(data.size - bytesSent, bulkOut.maxPacketSize)
            val chunk = data.copyOfRange(bytesSent, bytesSent + chunkSize)
            sendCcidPcToRdrMessage(chunk)
            bytesSent += chunkSize
        }

        return receiveCcidRdrToPcMessage(seq).data
    }


    @OptIn(ExperimentalStdlibApi::class)
    fun getDescriptor(interfaceIdx: Int): CcidDescriptor? {
        val rawDescriptors = usbDeviceConnection.rawDescriptors
        var byteIndex = 0
        var currInterfaceNumber = 0

        while (byteIndex < rawDescriptors.size) {
            val descriptorLength = rawDescriptors[byteIndex].toInt() and 0xff
            val descriptorType = rawDescriptors[byteIndex + 1].toInt() and 0xff

            // Check if it's an interface descriptor
            if (descriptorType == 0x04) {
                currInterfaceNumber = rawDescriptors[byteIndex + 2].toInt() and 0xff
            }
            // Check if it's a CCID class descriptor and the interface number matches
            else if (descriptorType == 0x21 && currInterfaceNumber == interfaceIdx) {
                val dwProtocols = (rawDescriptors[byteIndex + 6].toInt() and 0xff) or
                        ((rawDescriptors[byteIndex + 7].toInt() and 0xff) shl 8) or
                        ((rawDescriptors[byteIndex + 8].toInt() and 0xff) shl 16) or
                        ((rawDescriptors[byteIndex + 9].toInt() and 0xff) shl 24)
                val dwFeatures = (rawDescriptors[byteIndex + 40].toInt() and 0xff) or
                        ((rawDescriptors[byteIndex + 41].toInt() and 0xff) shl 8) or
                        ((rawDescriptors[byteIndex + 42].toInt() and 0xff) shl 16) or
                        ((rawDescriptors[byteIndex + 43].toInt() and 0xff) shl 24)
                val dwMaxIFSD = (rawDescriptors[byteIndex + 28].toInt() and 0xff) or
                        ((rawDescriptors[byteIndex + 29].toInt() and 0xff) shl 8) or
                        ((rawDescriptors[byteIndex + 30].toInt() and 0xff) shl 16) or
                        ((rawDescriptors[byteIndex + 31].toInt() and 0xff) shl 24)
                val maxSlot = (rawDescriptors[byteIndex + 4].toInt() and 0xff)
                var voltage = (rawDescriptors[byteIndex + 5].toInt() and 0xff) shl 1
                val levelOfExchange = when ((dwFeatures shr 16) and 0xFF) {
                    0x01 -> LevelOfExchange.TPDU
                    0x02 -> LevelOfExchange.ShortAPDU
                    0x04 -> LevelOfExchange.ExtendedAPDU
                    else -> throw CcidException("Unknown level of exchange")
                }


                if (dwFeatures and 0x8 == 0x8) {
                    voltage = voltage or 1
                }

                return CcidDescriptor(dwProtocols.toByte(), levelOfExchange, dwMaxIFSD, maxSlot, voltage, rawDescriptors.toHexString())
            }

            byteIndex += descriptorLength
        }

        return null
    }

    @OptIn(ExperimentalStdlibApi::class)
    private fun sendCcidPcToRdrMessage(message: ByteArray) {
        Log.d("CCID PC TO RDR", message.toHexString())
        val transmitted = usbDeviceConnection.bulkTransfer(bulkOut, message, message.size, 4000)
        if (transmitted != message.size) {
            throw CcidException("Failed to transmit data ($transmitted / ${message.size})")
        }
    }

    private fun receiveCcidRdrToPcMessage(expectedSeq: Byte): CcidRdrToPcMessage {
        var message: CcidRdrToPcMessage
        do {
            message = receiveRawMessage(expectedSeq)
        } while (message.isStatusTimeoutExtensionRequest)

        if (!message.isStatusSuccess) {
            if (message.iccStatus == 2) {
                throw CcidCardNotFoundException("Card error: ${message.iccStatus}")
            }

            throw CcidException("Card error: ${message.iccStatus}")
        }

        return message
    }

    private fun receiveRawMessage(expectedSeq: Byte): CcidRdrToPcMessage {
        var retries = 3
        var bytesRead: Int
        val buffer = ByteArray(bulkIn.maxPacketSize)
        do {
            bytesRead = usbDeviceConnection.bulkTransfer(bulkIn, buffer, buffer.size, USB_TIMEOUT)
        } while (bytesRead <= 0 && retries-- > 0)

        if (bytesRead < HEADER_SIZE) {
            throw CcidException("Incorrect header")
        }
        if (buffer[0] != MESSAGE_TYPE_RDR_TO_PC_DATABLOCK) {
            throw CcidException("Unexpected message type")
        }
        val message = CcidRdrToPcMessage.parseHeader(buffer)
        if (message.seq != expectedSeq) {
            throw CcidException("Unexpected sequence number ${message.seq}, expected $expectedSeq")
        }

        val dataBuffer = ByteArray(message.length)
        var bytesBuffered = bytesRead - HEADER_SIZE
        System.arraycopy(buffer, HEADER_SIZE, dataBuffer, 0, bytesBuffered)

        while (bytesBuffered < message.length) {
            bytesRead = usbDeviceConnection.bulkTransfer(bulkIn, buffer, buffer.size, USB_TIMEOUT)
            if (bytesRead <= 0) {
                throw CcidException("Failed to read data")
            }
            System.arraycopy(buffer, 0, dataBuffer, bytesBuffered, bytesRead)
            bytesBuffered += bytesRead
        }

        return message.withData(dataBuffer)
    }

    companion object {
        private const val HEADER_SIZE = 10
        private const val USB_TIMEOUT = 5000

        private const val MESSAGE_TYPE_PC_TO_RDR_ICCPOWERON = 0x62.toByte()
        private const val MESSAGE_TYPE_PC_TO_RDR_ICCPOWEROFF = 0x63.toByte()
        private const val MESSAGE_TYPE_PC_TO_RDR_XFRBLOCK = 0x6F.toByte()
        private const val MESSAGE_TYPE_RDR_TO_PC_DATABLOCK = 0x80.toByte()
    }
}

class CcidException(message: String) : Exception(message)
class CcidCardNotFoundException(message: String) : Exception(message)

data class CcidRdrToPcMessage(
    val messageType: Byte,
    val length: Int,
    val slot: Byte,
    val seq: Byte,
    val status: Byte,
    val error: Byte,
    val specific: Byte,
    val data: ByteArray
) {
    fun withData(data: ByteArray): CcidRdrToPcMessage {
        return CcidRdrToPcMessage(
            messageType,
            length,
            slot,
            seq,
            status,
            error,
            specific,
            data
        )
    }

    val iccStatus: Int
        get() = status.toInt() and 0x03

    val commandStatus: Int
        get() = (status.toInt() shr 6) and 0x03

    val isStatusTimeoutExtensionRequest: Boolean
        get() = commandStatus == 0x02

    val isStatusSuccess: Boolean
        get() = commandStatus == 0x00 && iccStatus == 0x00

    companion object {
        fun parseHeader(data: ByteArray): CcidRdrToPcMessage {
            return CcidRdrToPcMessage(
                data[0],
                (data[1].toInt() and 0xff) or ((data[2].toInt() and 0xff) shl 8) or ((data[3].toInt() and 0xff) shl 16) or ((data[4].toInt() and 0xff) shl 24),
                data[5],
                data[6],
                data[7],
                data[8],
                data[9],
                byteArrayOf()
            )
        }
    }
}