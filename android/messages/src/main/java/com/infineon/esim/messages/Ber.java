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

package com.infineon.esim.messages;

import com.beanit.jasn1.ber.BerLength;
import com.beanit.jasn1.ber.BerTag;
import com.beanit.jasn1.ber.ReverseByteArrayOutputStream;
import com.beanit.jasn1.ber.types.BerOctetString;
import com.beanit.jasn1.ber.types.BerType;
import com.infineon.esim.util.Bytes;
import com.infineon.esim.util.Log;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.InvocationTargetException;
import java.util.List;

/**
 * Utility class for BER related operations such as encoding, decoding, stripping and swapping tags.
 */
@SuppressWarnings("unused")
public class Ber {
    private static final String TAG = Ber.class.getName();

    // Tags see: http://luca.ntop.org/Teaching/Appunti/asn1.html
    public static final BerTag BER_TAG_SEQUENCE_OF = new BerTag(BerTag.UNIVERSAL_CLASS, BerTag.CONSTRUCTED, 0x10); // 0x30
    public static final BerTag BER_TAG_TRANSACTION_ID = new BerTag(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 0x00); // 0x80
    public static final BerTag BER_TAG_CONTROL_REF_TEMPLATE = new BerTag(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 0x06); // 0xA6

    public static final BerTag BER_TAG_SIGNATURE = new BerTag(BerTag.APPLICATION_CLASS, BerTag.PRIMITIVE, 0x37); // 0x5F37
    public static final BerTag BER_TAG_OT_KEY = new BerTag(BerTag.APPLICATION_CLASS, BerTag.PRIMITIVE, 0x49); // 0x5F49


    public static final BerTag BER_TAG_FIRST_SEQ_OF_87_CONTAINER = new BerTag(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 0x00); // 0xA0
    public static final BerTag BER_TAG_SEQ_OF_88_CONTAINER = new BerTag(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 0x01); // 0xA1
    public static final BerTag BER_TAG_SECOND_SEQ_OF_87_CONTAINER = new BerTag(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 0x02); // 0xA2
    public static final BerTag BER_TAG_SEQ_OF_86_CONTAINER = new BerTag(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 0x03); // 0xA3

    public static final BerTag BER_TAG_SEQ_OF_86 = new BerTag(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 0x06); // 0x86
    public static final BerTag BER_TAG_SEQ_OF_87 = new BerTag(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 0x07); // 0x87
    public static final BerTag BER_TAG_SEQ_OF_88 = new BerTag(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 0x08); // 0x88

    private static final int ENCODING_SIZE_GUESS = 32; // Use standard ESG of ByteArrayOutputStream

    /**
     * Encodes a BER tag from a BerTag object to a byte array.
     * @param tag BerTag object to be encoded
     * @return Byte array representing the encoded BER tag
     */
    public static byte[] encodeTag(BerTag tag) {
        ReverseByteArrayOutputStream os = new ReverseByteArrayOutputStream(4);

        try {
            tag.encode(os);
        } catch (IOException e) {
            Log.error(TAG,"Error: IOException during encoding of BerTag object: " + tag + ".", e);
        }

        return os.getArray();
    }

    /**
     * Encodes a BER length from an int to a byte array.
     * @param length BER length as int to be encoded
     * @return Byte array representing the encoded BER length
     */
    public static byte[] encodeLength(int length) {
        // Java int range is from -2147483648 to 2147483647 and uses 4 Byte.
        if (length < 0) {
            Log.error(TAG,"Error: Negative length not supported: " + length);
            throw new IllegalArgumentException("Negative length not supported.");
        }

        final int BER_LENGTH_ESG = 4; // Assumption: length 0xFFFFFFFF because of int range. Resize if not...
        ReverseByteArrayOutputStream os = new ReverseByteArrayOutputStream(BER_LENGTH_ESG, true);

        try {
            BerLength.encodeLength(os, length);
        } catch (IOException e) {

            Log.error(TAG,"Eror: IOException during length encoding: ", e);
        }

        return os.getArray();
    }

    /**
     * Encodes a list of elements in a BER sequence ("SEQUENCE" or "SEQUENCE OF") to a byte array.
     * @param data Elements to be encoded as BER sequence
     * @return Byte array representing the encoded list of elements in a BER sequence as byte array.
     */
    public static byte[] encodeSequence(List<byte[]> data) {
        byte[] output = null;

        for (byte[] dataElement : data) {
            output = Bytes.concatenate(output, dataElement);
        }

        return encodeElement(output, BER_TAG_SEQUENCE_OF);
    }

    /**
     * Encodes a BER element without a tag using only length and value (LV).
     * @param data Element to be encoded
     * @return Byte array representing the encoded LV BER element
     */
    public static byte[] encodeElementWithoutTag(byte[] data) {
        return encodeElement(data, (byte[]) null);
    }

    /**
     * Encodes a BER element with tag, length and value (TLV).
     * @param data Element to be encoded
     * @param tag BER tag to be used
     * @return Byte array representing the encoded TLV BER element.
     */
    public static byte[] encodeElement(byte[] data, BerTag tag) {
        return encodeElement(data, encodeTag(tag));
    }

    private static byte[] encodeElement(byte[] data, byte[] tag) {
        byte[] dataEncoded = null;

        // Check if a tag shall be written
        if (tag != null) {
            dataEncoded = tag;
        }

        // Encode length and data
        byte[] length = encodeLength(data.length);
        dataEncoded = Bytes.concatenate(dataEncoded, length, data);

        return dataEncoded;
    }

    /**
     * Swaps the BER tag of an BER element
     * @param input BER TLV element as byte array
     * @param newTag new BER tag as BerTag object
     * @return BER element with new tag
     */
    public static byte[] swapTag(byte[] input, BerTag newTag) {
        return Ber.encodeElement(Ber.stripTagAndLength(input), newTag);
    }

    /**
     * Strips the tag and length bytes from an encoded BER TLV element
     * @param input BER TLV element to be stripped
     * @return Byte array representing the value
     */
    public static byte[] stripTagAndLength(byte[] input) {
        byte[] output = null;
        InputStream is = new ByteArrayInputStream(input);

        try {
            // Decode tag (and throw away)
            BerTag tag = new BerTag();
            tag.decode(is);

            // Decode length (and throw away)
            BerLength length = new BerLength();
            length.decode(is);

            // Write content to output
            if (length.val != 0) {
                output = Bytes.toByteArray(is);
            }
        } catch (IOException e) {
            Log.error(TAG,"Error: IOException during stripping of type and length of BER data.", e);
        }

        return output;
    }

    public static byte[] getTag(byte[] input) {
        InputStream is = new ByteArrayInputStream(input);

        try {
            BerTag tag = new BerTag();
            tag.decode(is);
            return encodeTag(tag);
        } catch (IOException e) {
            Log.error(TAG,"Error: IOException during stripping of type and length of BER data.", e);
        }

        return null;
    }

    public static byte[] getLength(byte[] input) {
        InputStream is = new ByteArrayInputStream(input);

        try {
            // Decode tag (and throw away)
            BerTag tag = new BerTag();
            tag.decode(is);

            BerLength length = new BerLength();
            length.decode(is);
            return encodeLength(length.val);
        } catch (IOException e) {
            Log.error(TAG,"Error: IOException during stripping of type and length of BER data.", e);
        }

        return null;
    }

    /**
     * Creates a BerType object from an BER encoded byte array.
     * @param tClass Class object of the desired BerType
     * @param input BER encoded byte array as input
     * @param <T> Class type of the desired BerType
     * @return BerType object of class T created from BER encoded byte array
     */
    public static <T extends BerType> T createFromEncodedByteArray(Class<T> tClass, byte[] input) {
        T berObject = null;

        try {
            berObject = tClass.getDeclaredConstructor().newInstance();
        } catch (InstantiationException e) {
            Log.error(TAG,"Error: InstantiationException for class \"" + tClass.getName() + "\" in while creating instance.", e);
        } catch (IllegalAccessException e) {
            Log.error(TAG,"Error: IllegalAccessException for class \"" + tClass.getName() + "\" in while creating instance.", e);
        } catch (InvocationTargetException e) {
            Log.error(TAG,"Error: InvocationTargetException for class \"" + tClass.getName() + "\" in while creating instance.", e);
        } catch (NoSuchMethodException e) {
            Log.error(TAG,"Error: NoSuchMethodException for class \"" + tClass.getName() + "\" in while creating instance.", e);
        }

        InputStream inputStream = new ByteArrayInputStream(input);

        try {
            if(berObject != null) {
                berObject.decode(inputStream);
            } else {
                return null;
            }
            inputStream.close();
        } catch (IOException e) {
            Log.error(TAG,"Error: IOException during  ASN1 message encoding", e);
        }

        Log.verbose(TAG,"Decoded object of class " + berObject.getClass().getName() + ": " + berObject);

        return berObject;
    }

    /**
     * Creates a BerType object from an BER encoded Hex-String object.
     * @param tClass Class object of the desired BerType
     * @param input BER encoded Hex-String object as input
     * @param <T> Class type of the desired BerType
     * @return BerType object of class T created from BER encoded Hex-String object
     */
    public static <T extends BerType> T createFromEncodedHexString(Class<T> tClass, String input) {
        return createFromEncodedByteArray(tClass, Bytes.decodeHexString(input));
    }

    /**
     * Creates a BerType object from an BER encoded Base64-String object.
     * @param tClass Class object of the desired BerType
     * @param input BER encoded Base64-String object as input
     * @param <T> Class type of the desired BerType
     * @return BerType object of class T created from BER encoded Base64-String object
     */
    public static <T extends BerType> T createFromEncodedBase64String(Class<T> tClass, String input) {
        return createFromEncodedByteArray(tClass, Bytes.decodeBase64String(input));
    }

    /**
     * Creates a signature of class BerOctetString from a BER encoded Base64-String object.
     * @param input BER encoded Base64-String object as input
     * @return BerOctetString created from BER encoded Base64-String object
     */
    public static BerOctetString createSignatureFromEncodedBase64String(String input) {
        // 5F37 tag and length 40 has to be scrapped
        byte[] signatureRaw = Bytes.decodeBase64String(input);
        byte[] signatureRawTrunc = Bytes.sub(signatureRaw, 3, signatureRaw.length - 3);
        return new BerOctetString(signatureRawTrunc);
    }

    /**
     * Returns BerType object as BER encoded bytes represented by a byte array.
     * @param berObject BerType object as input
     * @return BER encoded BerType object as byte array
     */
    public static byte[] getEncodedAsByteArray(BerType berObject) {
        int codeLength = 0;
        ReverseByteArrayOutputStream reverseByteArrayOutputStream = new ReverseByteArrayOutputStream(ENCODING_SIZE_GUESS, true);

        if(berObject == null) {
            return reverseByteArrayOutputStream.getArray();
        }

        Log.verbose(TAG,"Encoding object of class " + berObject.getClass().getSimpleName() + ": " + berObject);

        try {
            codeLength = berObject.encode(reverseByteArrayOutputStream);
            reverseByteArrayOutputStream.close();
        } catch (IOException e) {
            Log.error(TAG,"Error: IOException during  ASN1 message decoding", e);
        }

        byte[] output = reverseByteArrayOutputStream.getArray();

        if (codeLength != output.length) {
            Log.error(TAG,"Error: Decoding ASN1 message ended in code length mismatch: codeLength: " + codeLength + " output.length: " + output.length + ".");
        }

        return output;
    }

    /**
     * Returns BerType object as BER encoded bytes represented by a Hex-String object.
     * @param berObject BerType object as input
     * @return BER encoded BerType object as Hex-String object
     */
    public static String getEncodedAsHexString(BerType berObject) {
        return Bytes.encodeHexString(getEncodedAsByteArray(berObject));
    }

    /**
     * Returns BerType object as BER encoded bytes represented by a Base64-String object.
     * @param berObject BerType object as input
     * @return BER encoded BerType object as Base64-String object
     */
    public static String getEncodedAsBase64String(BerType berObject) {
        return Bytes.encodeBase64String(getEncodedAsByteArray(berObject));
    }

    /**
     * Returns BerType object as BER encoded value (without leading tag and length) represented by a byte array.
     *
     * NOTE: The value itself is BER encoded with tag and length as TLV.
     * @param berObject BerType object as input
     * @return BER encoded value BerType object as byte array
     */
    public static byte[] getEncodedValueAsByteArray(BerType berObject) {
        return stripTagAndLength(getEncodedAsByteArray(berObject));
    }

    /**
     * Returns BerType object as BER encoded value (without leading tag and length) represented by a Hex-String object.
     *
     * NOTE: The value itself is BER encoded with tag and length as TLV.
     * @param berObject BerType object as input
     * @return BER encoded value BerType object as Hex-String object
     */
    public static String getEncodedValueAsHexString(BerType berObject) {
        return Bytes.encodeHexString(getEncodedValueAsByteArray(berObject));
    }

    /**
     * Returns BerType object as BER encoded value (without leading tag and length) represented by a Base64-String object.
     *
     * NOTE: The value itself is BER encoded with tag and length as TLV.
     * @param berObject BerType object as input
     * @return BER encoded value BerType object as Base64-String object
     */
    public static String getEncodedValueAsBase64String(BerType berObject) {
        return Bytes.encodeBase64String(getEncodedValueAsByteArray(berObject));
    }

    public static String getEncodedTagAsHexString(BerType berObject) {
        return Bytes.encodeHexString(getTag(getEncodedAsByteArray(berObject)));
    }

    public static String getEncodedLengthAsHexString(BerType berObject) {
        return Bytes.encodeHexString(getLength(getEncodedAsByteArray(berObject)));
    }
}
