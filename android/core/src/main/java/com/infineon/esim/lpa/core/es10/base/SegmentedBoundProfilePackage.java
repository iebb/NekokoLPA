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

package com.infineon.esim.lpa.core.es10.base;

import androidx.annotation.NonNull;

import com.beanit.jasn1.ber.types.BerOctetString;
import com.gsma.sgp.messages.rspdefinitions.BoundProfilePackage;
import com.gsma.sgp.messages.rspdefinitions.InitialiseSecureChannelRequest;
import com.infineon.esim.messages.Ber;
import com.infineon.esim.util.Bytes;
import com.infineon.esim.util.Log;
import com.infineon.esim.util.Strings;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class SegmentedBoundProfilePackage {
    private static final String TAG = SegmentedBoundProfilePackage.class.getName();

    private static final int MAX_PAYLOAD_LENGTH = 240;

    private final BoundProfilePackage boundProfilePackage;
    private final List<List<String>> segments;

    public SegmentedBoundProfilePackage(BoundProfilePackage boundProfilePackage) {
        this.boundProfilePackage = boundProfilePackage;
        this.segments = segmentBoundProfilePackage(boundProfilePackage);
    }

    public BoundProfilePackage getBoundProfilePackage() {
        return boundProfilePackage;
    }

    public List<List<String>> getSegments() {
        return segments;
    }

    /*
    GSMA SGP.22 v2.4 section 2.5.5:
    The segmentation SHALL be done according to the structure of the Bound Profile Package:
      * Tag and length fields of the BoundProfilePackage TLV plus the initialiseSecureChannelRequest TLV
      * Tag and length fields of the first sequenceOf87 TLV plus the first '87' TLV
      * Tag and length fields of the sequenceOf88 TLV
      * Each of the '88' TLVs
      * Tag and length fields of the sequenceOf87 TLV plus the first '87' TLV
      * Tag and length fields of the sequenceOf86 TLV
      * Each of the '86' TLVs
     */

    private static List<List<String>> segmentBoundProfilePackage(BoundProfilePackage boundProfilePackage) {
        Log.debug(TAG, "BoundProfilePackage: " + boundProfilePackage);

        List<List<String>> segmentList = new ArrayList<>();
        segmentList.add(extractInitializeSecureChannelRequest(boundProfilePackage));
        segmentList.add(extractFirstSequenceOf87(boundProfilePackage));
        segmentList.add(extractHeadOfSequenceOf88(boundProfilePackage));
        segmentList.add(extractSequenceOf88(boundProfilePackage));
        if(boundProfilePackage.getSecondSequenceOf87() != null) {
            segmentList.add(extractSecondSequenceOf87(boundProfilePackage));
        }
        segmentList.add(extractHeadOfSequenceOf86(boundProfilePackage));
        segmentList.add(extractSequenceOf86(boundProfilePackage));

        return segmentList;
    }

    private static List<String> extractInitializeSecureChannelRequest(BoundProfilePackage boundProfilePackage) {
        byte[] tag = Ber.getTag(Ber.getEncodedAsByteArray(boundProfilePackage));
        byte[] length = Ber.getLength(Ber.getEncodedAsByteArray(boundProfilePackage));

        InitialiseSecureChannelRequest initialiseSecureChannelRequest = boundProfilePackage.getInitialiseSecureChannelRequest();

        String command = Bytes.encodeHexString(tag) +
                Bytes.encodeHexString(length) +
                Ber.getEncodedAsHexString(initialiseSecureChannelRequest);

        return Collections.singletonList(command);
    }


    private static List<String> extractFirstSequenceOf87(BoundProfilePackage boundProfilePackage) {
        BoundProfilePackage.FirstSequenceOf87 firstSequenceOf87 = boundProfilePackage.getFirstSequenceOf87();

        byte[] encFirstSequenceOf87 = Ber.swapTag(Ber.getEncodedAsByteArray(firstSequenceOf87), Ber.BER_TAG_FIRST_SEQ_OF_87_CONTAINER);

        Log.debug(TAG, "FirstSequenceOf87: " + Strings.splitByLength(Bytes.encodeHexString(encFirstSequenceOf87), MAX_PAYLOAD_LENGTH));

        String command = Bytes.encodeHexString(encFirstSequenceOf87);

        return Collections.singletonList(command);
    }


    private static List<String> extractHeadOfSequenceOf88(BoundProfilePackage boundProfilePackage) {
        BoundProfilePackage.SequenceOf88 sequenceOf88 = boundProfilePackage.getSequenceOf88();

        String tag = Bytes.encodeHexString(Ber.encodeTag(Ber.BER_TAG_SEQ_OF_88_CONTAINER));
        String length = Ber.getEncodedLengthAsHexString(sequenceOf88);
        String command = tag + length;

        return Collections.singletonList(command);
    }

    private static List<String> extractSequenceOf88(BoundProfilePackage boundProfilePackage) {
        BoundProfilePackage.SequenceOf88 sequenceOf88 = boundProfilePackage.getSequenceOf88();

        List<String> commandList = new ArrayList<>();
        for(BerOctetString berOctetString : sequenceOf88.getBerOctetString()) {
            byte[] encSeqOf88Part = Ber.encodeElement(Ber.getEncodedValueAsByteArray(berOctetString), Ber.BER_TAG_SEQ_OF_88);
            commandList.add(Bytes.encodeHexString(encSeqOf88Part));
        }

        return commandList;
    }

    private static List<String> extractSecondSequenceOf87(BoundProfilePackage boundProfilePackage) {
        BoundProfilePackage.SecondSequenceOf87 secondSequenceOf87 = boundProfilePackage.getSecondSequenceOf87();

        byte[] encSecondSequenceOf87 = Ber.swapTag(Ber.getEncodedAsByteArray(secondSequenceOf87), Ber.BER_TAG_SECOND_SEQ_OF_87_CONTAINER);

        String command = Bytes.encodeHexString(encSecondSequenceOf87);

        return Collections.singletonList(command);
    }

    private static List<String> extractHeadOfSequenceOf86(BoundProfilePackage boundProfilePackage) {
        BoundProfilePackage.SequenceOf86 sequenceOf86 = boundProfilePackage.getSequenceOf86();

        String tag = Bytes.encodeHexString(Ber.encodeTag(Ber.BER_TAG_SEQ_OF_86_CONTAINER));
        String length = Ber.getEncodedLengthAsHexString(sequenceOf86);
        String command = tag + length;

        return Collections.singletonList(command);
    }

    private static List<String> extractSequenceOf86(BoundProfilePackage boundProfilePackage) {
        BoundProfilePackage.SequenceOf86 sequenceOf86 = boundProfilePackage.getSequenceOf86();

        List<String> commandList = new ArrayList<>();

        for(BerOctetString berOctetString : sequenceOf86.getBerOctetString()) {
            byte[] encSeqOf86Part = Ber.encodeElement(Ber.getEncodedValueAsByteArray(berOctetString), Ber.BER_TAG_SEQ_OF_86);
            commandList.add(Bytes.encodeHexString(encSeqOf86Part));
        }

        return commandList;
    }

    @NonNull
    @Override
    public String toString() {
        StringBuilder stringBuilder = new StringBuilder();
        stringBuilder.append("SegmentedBoundProfilePackage{");


        for (int i = 0; i < segments.size(); i++) {
            List<String> sequence = segments.get(i);
            for (int j = 0; j < sequence.size(); j++) {
                String segment = sequence.get(j);

                stringBuilder.append(i).append("/").append(j).append(": ").append(segment);
            }
        }

        stringBuilder.append("}");

        return stringBuilder.toString();
    }
}
