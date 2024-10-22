/**
 * This class file was automatically generated by asn1bean v1.11.3 (http://www.beanit.com)
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
import com.beanit.asn1bean.ber.*;
import com.beanit.asn1bean.ber.types.*;
import com.beanit.asn1bean.ber.types.string.*;

import com.gsma.sgp.messages.pedefinitions.UICCCapability;
import com.gsma.sgp.messages.pkix1explicit88.Certificate;
import com.gsma.sgp.messages.pkix1explicit88.CertificateList;
import com.gsma.sgp.messages.pkix1explicit88.Time;
import com.gsma.sgp.messages.pkix1implicit88.SubjectKeyIdentifier;

public class OtherSignedNotification implements BerType, Serializable {

	private static final long serialVersionUID = 1L;

	public static final BerTag tag = new BerTag(BerTag.UNIVERSAL_CLASS, BerTag.CONSTRUCTED, 16);

	public byte[] code = null;
	private NotificationMetadata tbsOtherNotification = null;
	private EuiccSign euiccNotificationSignature = null;
	private Certificate euiccCertificate = null;
	private Certificate nextCertInChain = null;
	private CertificateChain otherCertsInChain = null;
	
	public OtherSignedNotification() {
	}

	public OtherSignedNotification(byte[] code) {
		this.code = code;
	}

	public void setTbsOtherNotification(NotificationMetadata tbsOtherNotification) {
		this.tbsOtherNotification = tbsOtherNotification;
	}

	public NotificationMetadata getTbsOtherNotification() {
		return tbsOtherNotification;
	}

	public void setEuiccNotificationSignature(EuiccSign euiccNotificationSignature) {
		this.euiccNotificationSignature = euiccNotificationSignature;
	}

	public EuiccSign getEuiccNotificationSignature() {
		return euiccNotificationSignature;
	}

	public void setEuiccCertificate(Certificate euiccCertificate) {
		this.euiccCertificate = euiccCertificate;
	}

	public Certificate getEuiccCertificate() {
		return euiccCertificate;
	}

	public void setNextCertInChain(Certificate nextCertInChain) {
		this.nextCertInChain = nextCertInChain;
	}

	public Certificate getNextCertInChain() {
		return nextCertInChain;
	}

	public void setOtherCertsInChain(CertificateChain otherCertsInChain) {
		this.otherCertsInChain = otherCertsInChain;
	}

	public CertificateChain getOtherCertsInChain() {
		return otherCertsInChain;
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
		if (otherCertsInChain != null) {
			codeLength += otherCertsInChain.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 1
			reverseOS.write(0xA1);
			codeLength += 1;
		}
		
		codeLength += nextCertInChain.encode(reverseOS, true);
		
		codeLength += euiccCertificate.encode(reverseOS, true);
		
		codeLength += euiccNotificationSignature.encode(reverseOS, true);
		
		codeLength += tbsOtherNotification.encode(reverseOS, true);
		
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
		if (berTag.equals(NotificationMetadata.tag)) {
			tbsOtherNotification = new NotificationMetadata();
			subCodeLength += tbsOtherNotification.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(EuiccSign.tag)) {
			euiccNotificationSignature = new EuiccSign();
			subCodeLength += euiccNotificationSignature.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(Certificate.tag)) {
			euiccCertificate = new Certificate();
			subCodeLength += euiccCertificate.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(Certificate.tag)) {
			nextCertInChain = new Certificate();
			subCodeLength += nextCertInChain.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 1)) {
			otherCertsInChain = new CertificateChain();
			subCodeLength += otherCertsInChain.decode(is, false);
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
		if (tbsOtherNotification != null) {
			sb.append("tbsOtherNotification: ");
			tbsOtherNotification.appendAsString(sb, indentLevel + 1);
		}
		else {
			sb.append("tbsOtherNotification: <empty-required-field>");
		}
		
		sb.append(",\n");
		for (int i = 0; i < indentLevel + 1; i++) {
			sb.append("\t");
		}
		if (euiccNotificationSignature != null) {
			sb.append("euiccNotificationSignature: ").append(euiccNotificationSignature);
		}
		else {
			sb.append("euiccNotificationSignature: <empty-required-field>");
		}
		
		sb.append(",\n");
		for (int i = 0; i < indentLevel + 1; i++) {
			sb.append("\t");
		}
		if (euiccCertificate != null) {
			sb.append("euiccCertificate: ");
			euiccCertificate.appendAsString(sb, indentLevel + 1);
		}
		else {
			sb.append("euiccCertificate: <empty-required-field>");
		}
		
		sb.append(",\n");
		for (int i = 0; i < indentLevel + 1; i++) {
			sb.append("\t");
		}
		if (nextCertInChain != null) {
			sb.append("nextCertInChain: ");
			nextCertInChain.appendAsString(sb, indentLevel + 1);
		}
		else {
			sb.append("nextCertInChain: <empty-required-field>");
		}
		
		if (otherCertsInChain != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("otherCertsInChain: ");
			otherCertsInChain.appendAsString(sb, indentLevel + 1);
		}
		
		sb.append("\n");
		for (int i = 0; i < indentLevel; i++) {
			sb.append("\t");
		}
		sb.append("}");
	}

}

