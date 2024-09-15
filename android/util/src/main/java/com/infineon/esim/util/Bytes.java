/*
 * THE SOURCE CODE AND ITS RELATED DOCUMENTATION IS PROVIDED "AS IS". INFINEON
 * TECHNOLOGIES MAKES NO OTHER WARRANTY OF ANY KIND,WHETHER EXPRESS,IMPLIED OR,
 * STATUTORY AND DISCLAIMS ANY AND ALL IMPLIED WARRANTIES OF MERCHANTABILITY,
 * SATISFACTORY QUALITY, NON INFRINGEMENT AND FITNESS FOR A PARTICULAR PURPOSE.
 *
 * THE SOURCE CODE AND DOCUMENTATION MAY INCLUDE ERRORS. INFINEON TECHNOLOGIES
 * RESERVES THE RIGHT TO INCORPORATE MODIFICATIONS TO THE SOURCE CODE IN LATER
 * REVISIONS OF IT, AND TO MAKE IMPROVEMENTS OR CHANGES IN THE DOCUMENTATION OR
 * THE PRODUCTS OR TECHNOLOGIES DESCRIBED THEREIN AT ANY TIME.
 *
 * INFINEON TECHNOLOGIES SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT OR
 * CONSEQUENTIAL DAMAGE OR LIABILITY ARISING FROM YOUR USE OF THE SOURCE CODE OR
 * ANY DOCUMENTATION, INCLUDING BUT NOT LIMITED TO, LOST REVENUES, DATA OR
 * PROFITS, DAMAGES OF ANY SPECIAL, INCIDENTAL OR CONSEQUENTIAL NATURE, PUNITIVE
 * DAMAGES, LOSS OF PROPERTY OR LOSS OF PROFITS ARISING OUT OF OR IN CONNECTION
 * WITH THIS AGREEMENT, OR BEING UNUSABLE, EVEN IF ADVISED OF THE POSSIBILITY OR
 * PROBABILITY OF SUCH DAMAGES AND WHETHER A CLAIM FOR SUCH DAMAGE IS BASED UPON
 * WARRANTY, CONTRACT, TORT, NEGLIGENCE OR OTHERWISE.
 *
 * (C)Copyright INFINEON TECHNOLOGIES All rights reserved
 */

package com.infineon.esim.util;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigInteger;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;

/**
 * Utility class for byte operations.
 */
@SuppressWarnings("unused")
public class Bytes {
    private static final String TAG = Bytes.class.getName();

    public static final byte[] EMPTY_BYTE_ARRAY = new byte[0];
    public static final byte[] ZERO_BYTE = new byte[] {(byte) 0x00};

    /**
     * Converts an byte to a byte array.
     * @param input byte to be converted
     * @return Byte array containing containing byte
     */
    public static byte[] toByteArray(final byte input) {
        return new byte[]{input};
    }

    /**
     * Converts an int to a byte array.
     * @param input int to be converted
     * @return Byte array containing containing int
     */
    public static byte[] toByteArray(final int input) {
        return new byte[]{(byte) input};
    }

    /**
     * Converts an InputStream object to a byte array.
     * @param input InputStream to be converted
     * @return Byte array containing containing input from InputStream object
     */
    public static byte[] toByteArray(final InputStream input) {
        ByteArrayOutputStream output = new ByteArrayOutputStream();

        byte[] buffer = new byte[1024];
        int bytes;
        try {
            while ((bytes = input.read(buffer)) > 0) {
                output.write(buffer, 0, bytes);
            }
        } catch (IOException e) {
            Log.error(TAG,"Error: IOException during conversion from InputSteam to byte[].");
            return null;
        }

        return output.toByteArray();
    }

    /**
     * Strips a byte array of a leading zero (if there is one).
     * @param input Input to be stripped of leading zero
     * @return Byte array with stripped leading zero
     */
    public static byte[] getStrippedOfLeadingZero(byte[] input) {
        byte[] output;

        if (input.length > 0) {
            // Clean out leading zero
            if (input[0] == 0x00) {
                output = Bytes.sub(input, 1, input.length - 1);
            } else {
                output = input;
            }
        } else {
            output = input;
        }

        return output;
    }

    /**
     * Pads a byte array from the left with given length and given padding byte.
     * @param input Byte array to be padded
     * @param padding Padding byte to be used
     * @param length Desired length of the new byte array
     * @return Left padded byte array
     */
    public static byte[] leftPad(byte[] input, byte padding, int length) {
        if(input.length > length) {
            Log.error(TAG,"Error during left padding of byte array. Array too long!");
            return null;
        }

        byte[] output = new byte[length];
        int paddingLength = (length - input.length);

        for(int i = 0; i < length; i++) {
            if(i < paddingLength) {
                output[i] = padding;
            } else {
                output[i] = input[i - paddingLength];
            }
        }

        return output;
    }

    /**
     * Removes the left padding from a byte array.
     * @param input Byte array to be unpadded
     * @param padding Padding byte to be used
     * @return Unpadded byte array
     */
    public static byte[] removeLeftPadding(byte[] input, byte padding) {
        for(int i = 0; i < input.length; i++) {
            if(input[i] != padding) {
                return Bytes.sub(input, i, input.length - i);
            }
        }

        return Bytes.EMPTY_BYTE_ARRAY;
    }

    /**
     * Increments a byte array by 1. E.g. 00 00 00 00 becomes 00 00 00 01.
     *
     * NOTE: There is no overflow protection, e.g. FF FF FF FF becomes 00 00 00 00.
     * @param input Byte array to be incremented
     * @return Incremented byte array
     */
    public static byte[] increment(byte[] input) {
        byte[] output = Arrays.copyOf(input, input.length);

        for (int i = output.length - 1; i >= 0; i--) {
            if (output[i] == (byte) 0xFF) {
                output[i] = (byte) 0x00;
            } else {
                output[i]++;
                break;
            }
        }

        return output;
    }

    /**
     * Splits a byte array into List elements of size blockSize .
     * @param data Byte array to be split
     * @param blockSize Blocksize to be used for splitting
     * @return List object with byte arrays of size blockSize
     */
    public static List<byte[]> split(byte[] data, int blockSize) {
        List<byte[]> list = new ArrayList<>();

        int blockLength;
        int start = 0;
        while (start < data.length) {
            if ((start + blockSize) < data.length) {
                blockLength = blockSize;
            } else {
                blockLength = data.length - start;
            }
            list.add(Bytes.sub(data, start, blockLength));

            start += blockLength;
        }

        return list;
    }

    /**
     * Concatenates the supplied byte arrays into a single byte array.
     * <p>
     * If no byte arrays are supplied, a byte array of length zero is returned.<br>
     * If any of the component arrays are <code>null</code>, they are treated as arrays of length zero.
     * <p>
     * <code>null</code> will never be returned.
     * An array of length zero will be returned if there are no array elements in the result.
     *
     * @param arrays the array of byte arrays to be concatenated.
     * @return the concatenated byte array.
     */
    public static byte[] concatenate(byte[]... arrays) {
        // check we've got something
        if (arrays == null) {
            return EMPTY_BYTE_ARRAY;
        }

        // get the total length of the byte arrays
        int length = 0;
        for (int i = 0; i < arrays.length; i++) {
            // ensure we have a proper byte array
            if (arrays[i] == null) {
                arrays[i] = EMPTY_BYTE_ARRAY;
            }
            // add on its length
            length += arrays[i].length;
        }

        // make the return array
        byte[] concatenation = new byte[length];

        // copy the contents of the source arrays into the destination
        int count = 0;
        for (byte[] array : arrays) {
            System.arraycopy(array, 0, concatenation, count, array.length);
            count += array.length;
        }

        return concatenation;
    }


    /**
     * Extract a sub array from provided input data. The length of the sub array will be truncated if the input data
     * is not long enough.
     *
     * @param byteData the data to extract the sub array from
     * @param index    the index into the array to start the sub array at
     * @param length   the length of the sub array
     * @return the sub array
     */
    public static byte[] sub(byte[] byteData, int index, int length) {
        // Check if we need to truncate the length.
        if(index >= byteData.length) {
            Log.error(TAG,"Error: index greater than byte array size.");
            return EMPTY_BYTE_ARRAY;
        }

        if(index < 0) {
            Log.error(TAG,"Error: index must be greater than 0.");
            return EMPTY_BYTE_ARRAY;
        }


        if (length <= 0) {
            return EMPTY_BYTE_ARRAY;
        }

        if ((index + length) > (byteData.length)) {
            length = byteData.length - index;
        }

        return Arrays.copyOfRange(byteData, index, index + length);
    }

    /**
     * Converts a long to a byte array.
     * @param x long to be converted
     * @return Byte array containing the long value
     */
    public static byte[] longToBytes(long x) {
        ByteBuffer buffer = ByteBuffer.allocate(Long.BYTES);
        buffer.putLong(0, x);
        return buffer.array();
    }

    /**
     * Converts a byte array to a long value
     * @param bytes Byte array to be converted
     * @return long value converted from byte array
     */
    public static long bytesToLong(byte[] bytes) {
        if(bytes.length > Long.BYTES) {
            throw new IllegalArgumentException("Byte array to long for long value. Maximum of " + Long.BYTES + "bytes allowed.");
        }
        ByteBuffer buffer = ByteBuffer.allocate(Long.BYTES);
        buffer.put(bytes, 0, bytes.length);
        buffer.flip();//need flip
        return buffer.getLong();
    }

    /**
     * Encodes a byte array to a String object in HEX encoding.
     * @param byteArray Byte array to be encoded
     * @return Base64 encoded String object
     */
    public static String encodeHexString( byte[] byteArray) {
        if(byteArray == null) {
            return "";
        }
        StringBuilder hexStringBuilder = new StringBuilder();
        for (byte b : byteArray) {
            hexStringBuilder.append(byteToHex(b));
        }
        return hexStringBuilder.toString();
    }

    /**
     * Decodes a String object in HEX encoding to a byte array.
     *
     * NOTE: The HEX string cannot include whitespace characters.
     * @param hexString HEX String object to be decoded
     * @return Byte array containing data from HEX String
     */
    public static byte[] decodeHexString(String hexString) {
        if (hexString.length() % 2 == 1) {
            throw new IllegalArgumentException(
                    "Invalid hexadecimal String supplied.");
        }

        byte[] bytes = new byte[hexString.length() / 2];
        for (int i = 0; i < hexString.length(); i += 2) {
            bytes[i / 2] = hexToByte(hexString.substring(i, i + 2));
        }
        return bytes;
    }

    /**
     * Decodes a String object in binary encoding to a byte array.
     * @param binaryString Binary String object to be decoded
     * @return Byte array containing data from binary String
     */
    public static byte[] decodeBinaryString(String binaryString) {
        return new BigInteger(binaryString, 2).toByteArray();
    }

    /**
     * Decodes String object in binary encoding to a boolean array
     * @param binaryString Binary String object to be decoded
     * @return Boolean array containing data from binary String
     */
    public static boolean[] decodeBinaryStringToBooleanArray(String binaryString) {
        boolean[] boolArray = new boolean[binaryString.length()];

        for(int i = 0; i < binaryString.length(); i++) {
            switch(binaryString.charAt(i)) {
                case '0':
                    boolArray[i] = false;
                    break;
                case '1':
                    boolArray[i] = true;
                    break;
                default:
                    throw new IllegalArgumentException("Invalid character " + binaryString.charAt(i) + " during decoding of binary String object.");
            }
        }

        return boolArray;
    }

    /**
     * Encodes a byte array to a String object in Base64 encoding
     * @param input Byte array to be encoded
     * @return Base64 encoded String object
     */
    public static String encodeBase64String(byte[] input) {
        if (input == null) return "null";
        return Base64.getEncoder().encodeToString(input);
    }

    /**
     * Decodes a Base64 String object to a byte array
     * @param input Base64 String to be decoded
     * @return Byte array with decoded data
     */
    public static byte[] decodeBase64String(String input) {
        String str = input.replace("\n","");
        return Base64.getDecoder().decode(str);
    }

    public static String encodeString(byte[] input) {
        return new String(input);
    }

    public static byte[] decodeString(String input) {
        return input.getBytes(StandardCharsets.UTF_8);
    }

    public static byte[] decodeStringTruncated(String input, int length) {
        return decodeString(input.substring(0, Math.min(input.length(), length)));
    }

    private static String byteToHex(byte num) {
        char[] hexDigits = new char[2];
        hexDigits[0] = Character.forDigit((num >> 4) & 0xF, 16);
        hexDigits[1] = Character.forDigit((num & 0xF), 16);
        return new String(hexDigits).toUpperCase();
    }

    private static byte hexToByte(String hexString) {
        int firstDigit = toDigit(hexString.toLowerCase().charAt(0));
        int secondDigit = toDigit(hexString.toLowerCase().charAt(1));
        return (byte) ((firstDigit << 4) + secondDigit);
    }

    private static int toDigit(char hexChar) {
        int digit = Character.digit(hexChar, 16);
        if (digit == -1) {
            throw new IllegalArgumentException("Invalid Hexadecimal Character: " + hexChar);
        }
        return digit;
    }
}
