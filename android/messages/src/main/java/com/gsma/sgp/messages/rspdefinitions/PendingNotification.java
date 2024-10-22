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

public class PendingNotification implements BerType, Serializable {

	private static final long serialVersionUID = 1L;

	public byte[] code = null;
	private ProfileInstallationResult profileInstallationResult = null;
	private OtherSignedNotification otherSignedNotification = null;
	private LoadRpmPackageResultSigned loadRpmPackageResultSigned = null;
	
	public PendingNotification() {
	}

	public PendingNotification(byte[] code) {
		this.code = code;
	}

	public void setProfileInstallationResult(ProfileInstallationResult profileInstallationResult) {
		this.profileInstallationResult = profileInstallationResult;
	}

	public ProfileInstallationResult getProfileInstallationResult() {
		return profileInstallationResult;
	}

	public void setOtherSignedNotification(OtherSignedNotification otherSignedNotification) {
		this.otherSignedNotification = otherSignedNotification;
	}

	public OtherSignedNotification getOtherSignedNotification() {
		return otherSignedNotification;
	}

	public void setLoadRpmPackageResultSigned(LoadRpmPackageResultSigned loadRpmPackageResultSigned) {
		this.loadRpmPackageResultSigned = loadRpmPackageResultSigned;
	}

	public LoadRpmPackageResultSigned getLoadRpmPackageResultSigned() {
		return loadRpmPackageResultSigned;
	}

	public int encode(OutputStream reverseOS) throws IOException {

		if (code != null) {
			for (int i = code.length - 1; i >= 0; i--) {
				reverseOS.write(code[i]);
			}
			return code.length;
		}

		int codeLength = 0;
		if (loadRpmPackageResultSigned != null) {
			codeLength += loadRpmPackageResultSigned.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 1
			reverseOS.write(0xA1);
			codeLength += 1;
			return codeLength;
		}
		
		if (otherSignedNotification != null) {
			codeLength += otherSignedNotification.encode(reverseOS, true);
			return codeLength;
		}
		
		if (profileInstallationResult != null) {
			codeLength += profileInstallationResult.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 55
			reverseOS.write(0x37);
			reverseOS.write(0xBF);
			codeLength += 2;
			return codeLength;
		}
		
		throw new IOException("Error encoding CHOICE: No element of CHOICE was selected.");
	}

	public int decode(InputStream is) throws IOException {
		return decode(is, null);
	}

	public int decode(InputStream is, BerTag berTag) throws IOException {

		int codeLength = 0;
		BerTag passedTag = berTag;

		if (berTag == null) {
			berTag = new BerTag();
			codeLength += berTag.decode(is);
		}

		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 55)) {
			profileInstallationResult = new ProfileInstallationResult();
			codeLength += profileInstallationResult.decode(is, false);
			return codeLength;
		}

		if (berTag.equals(OtherSignedNotification.tag)) {
			otherSignedNotification = new OtherSignedNotification();
			codeLength += otherSignedNotification.decode(is, false);
			return codeLength;
		}

		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 1)) {
			loadRpmPackageResultSigned = new LoadRpmPackageResultSigned();
			codeLength += loadRpmPackageResultSigned.decode(is, false);
			return codeLength;
		}

		if (passedTag != null) {
			return 0;
		}

		throw new IOException("Error decoding CHOICE: Tag " + berTag + " matched to no item.");
	}

	public void encodeAndSave(int encodingSizeGuess) throws IOException {
		ReverseByteArrayOutputStream reverseOS = new ReverseByteArrayOutputStream(encodingSizeGuess);
		encode(reverseOS);
		code = reverseOS.getArray();
	}

	public String toString() {
		StringBuilder sb = new StringBuilder();
		appendAsString(sb, 0);
		return sb.toString();
	}

	public void appendAsString(StringBuilder sb, int indentLevel) {

		if (profileInstallationResult != null) {
			sb.append("profileInstallationResult: ");
			profileInstallationResult.appendAsString(sb, indentLevel + 1);
			return;
		}

		if (otherSignedNotification != null) {
			sb.append("otherSignedNotification: ");
			otherSignedNotification.appendAsString(sb, indentLevel + 1);
			return;
		}

		if (loadRpmPackageResultSigned != null) {
			sb.append("loadRpmPackageResultSigned: ");
			loadRpmPackageResultSigned.appendAsString(sb, indentLevel + 1);
			return;
		}

		sb.append("<none>");
	}

}

