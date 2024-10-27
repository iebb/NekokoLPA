/**
 * This class file was automatically generated by jASN1 v1.11.3 (http://www.beanit.com)
 */

package com.gsma.sgp.messages.rspdefinitions;

import java.io.IOException;
import java.io.EOFException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;
import java.util.ArrayList;
import java.util.Iterator;
import java.io.UnsupportedEncodingException;
import java.math.BigInteger;
import java.io.Serializable;
import com.beanit.jasn1.ber.*;
import com.beanit.jasn1.ber.types.*;
import com.beanit.jasn1.ber.types.string.*;

import com.gsma.sgp.messages.pedefinitions.UICCCapability;
import com.gsma.sgp.messages.pkix1explicit88.Certificate;
import com.gsma.sgp.messages.pkix1explicit88.CertificateList;
import com.gsma.sgp.messages.pkix1explicit88.Time;
import com.gsma.sgp.messages.pkix1implicit88.SubjectKeyIdentifier;

public class NotificationMetadata implements BerType, Serializable {

	private static final long serialVersionUID = 1L;

	public static final BerTag tag = new BerTag(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 47);

	public byte[] code = null;
	private BerInteger seqNumber = null;
	private NotificationEvent profileManagementOperation = null;
	private BerUTF8String notificationAddress = null;
	private Iccid iccid = null;
	
	public NotificationMetadata() {
	}

	public NotificationMetadata(byte[] code) {
		this.code = code;
	}

	public void setSeqNumber(BerInteger seqNumber) {
		this.seqNumber = seqNumber;
	}

	public BerInteger getSeqNumber() {
		return seqNumber;
	}

	public void setProfileManagementOperation(NotificationEvent profileManagementOperation) {
		this.profileManagementOperation = profileManagementOperation;
	}

	public NotificationEvent getProfileManagementOperation() {
		return profileManagementOperation;
	}

	public void setNotificationAddress(BerUTF8String notificationAddress) {
		this.notificationAddress = notificationAddress;
	}

	public BerUTF8String getNotificationAddress() {
		return notificationAddress;
	}

	public void setIccid(Iccid iccid) {
		this.iccid = iccid;
	}

	public Iccid getIccid() {
		return iccid;
	}

	public int encode(OutputStream reverseOS) throws IOException {
		return encode(reverseOS, true);
	}

	public int encode(OutputStream reverseOS, boolean withTag) throws IOException {

		if (code != null) {
			for (int i = code.length - 1; i >= 0; i--) {
				reverseOS.write(code[i]);
			}
			if (withTag) {
				return tag.encode(reverseOS) + code.length;
			}
			return code.length;
		}

		int codeLength = 0;
		if (iccid != null) {
			codeLength += iccid.encode(reverseOS, true);
		}
		
		codeLength += notificationAddress.encode(reverseOS, true);
		
		codeLength += profileManagementOperation.encode(reverseOS, false);
		// write tag: CONTEXT_CLASS, PRIMITIVE, 1
		reverseOS.write(0x81);
		codeLength += 1;
		
		codeLength += seqNumber.encode(reverseOS, false);
		// write tag: CONTEXT_CLASS, PRIMITIVE, 0
		reverseOS.write(0x80);
		codeLength += 1;
		
		codeLength += BerLength.encodeLength(reverseOS, codeLength);

		if (withTag) {
			codeLength += tag.encode(reverseOS);
		}

		return codeLength;

	}

	public int decode(InputStream is) throws IOException {
		return decode(is, true);
	}

	public int decode(InputStream is, boolean withTag) throws IOException {
		int codeLength = 0;
		int subCodeLength = 0;
		BerTag berTag = new BerTag();

		if (withTag) {
			codeLength += tag.decodeAndCheck(is);
		}

		BerLength length = new BerLength();
		codeLength += length.decode(is);

		int totalLength = length.val;
		codeLength += totalLength;

		subCodeLength += berTag.decode(is);
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 0)) {
			seqNumber = new BerInteger();
			subCodeLength += seqNumber.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 1)) {
			profileManagementOperation = new NotificationEvent();
			subCodeLength += profileManagementOperation.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(BerUTF8String.tag)) {
			notificationAddress = new BerUTF8String();
			subCodeLength += notificationAddress.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(Iccid.tag)) {
			iccid = new Iccid();
			subCodeLength += iccid.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
		}
		throw new IOException("Unexpected end of sequence, length tag: " + totalLength + ", actual sequence length: " + subCodeLength);

		
	}

	public void encodeAndSave(int encodingSizeGuess) throws IOException {
		ReverseByteArrayOutputStream reverseOS = new ReverseByteArrayOutputStream(encodingSizeGuess);
		encode(reverseOS, false);
		code = reverseOS.getArray();
	}

	public String toString() {
		StringBuilder sb = new StringBuilder();
		appendAsString(sb, 0);
		return sb.toString();
	}

	public void appendAsString(StringBuilder sb, int indentLevel) {

		sb.append("{");
		sb.append("\n");
		for (int i = 0; i < indentLevel + 1; i++) {
			sb.append("\t");
		}
		if (seqNumber != null) {
			sb.append("seqNumber: ").append(seqNumber);
		}
		else {
			sb.append("seqNumber: <empty-required-field>");
		}
		
		sb.append(",\n");
		for (int i = 0; i < indentLevel + 1; i++) {
			sb.append("\t");
		}
		if (profileManagementOperation != null) {
			sb.append("profileManagementOperation: ").append(profileManagementOperation);
		}
		else {
			sb.append("profileManagementOperation: <empty-required-field>");
		}
		
		sb.append(",\n");
		for (int i = 0; i < indentLevel + 1; i++) {
			sb.append("\t");
		}
		if (notificationAddress != null) {
			sb.append("notificationAddress: ").append(notificationAddress);
		}
		else {
			sb.append("notificationAddress: <empty-required-field>");
		}
		
		if (iccid != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("iccid: ").append(iccid);
		}
		
		sb.append("\n");
		for (int i = 0; i < indentLevel; i++) {
			sb.append("\t");
		}
		sb.append("}");
	}

}

