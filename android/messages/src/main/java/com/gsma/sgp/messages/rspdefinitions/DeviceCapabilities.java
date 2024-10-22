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

public class DeviceCapabilities implements BerType, Serializable {

	private static final long serialVersionUID = 1L;

	public static final BerTag tag = new BerTag(BerTag.UNIVERSAL_CLASS, BerTag.CONSTRUCTED, 16);

	public byte[] code = null;
	private VersionType gsmSupportedRelease = null;
	private VersionType utranSupportedRelease = null;
	private VersionType cdma2000onexSupportedRelease = null;
	private VersionType cdma2000hrpdSupportedRelease = null;
	private VersionType cdma2000ehrpdSupportedRelease = null;
	private VersionType eutranEpcSupportedRelease = null;
	private VersionType contactlessSupportedRelease = null;
	private VersionType rspCrlSupportedVersion = null;
	private VersionType nrEpcSupportedRelease = null;
	private VersionType nr5gcSupportedRelease = null;
	private VersionType eutran5gcSupportedRelease = null;
	private VersionType lpaSvn = null;
	private CatSupportedClasses catSupportedClasses = null;
	private EuiccFormFactorType euiccFormFactorType = null;
	private DeviceAdditionalFeatureSupport deviceAdditionalFeatureSupport = null;
	
	public DeviceCapabilities() {
	}

	public DeviceCapabilities(byte[] code) {
		this.code = code;
	}

	public void setGsmSupportedRelease(VersionType gsmSupportedRelease) {
		this.gsmSupportedRelease = gsmSupportedRelease;
	}

	public VersionType getGsmSupportedRelease() {
		return gsmSupportedRelease;
	}

	public void setUtranSupportedRelease(VersionType utranSupportedRelease) {
		this.utranSupportedRelease = utranSupportedRelease;
	}

	public VersionType getUtranSupportedRelease() {
		return utranSupportedRelease;
	}

	public void setCdma2000onexSupportedRelease(VersionType cdma2000onexSupportedRelease) {
		this.cdma2000onexSupportedRelease = cdma2000onexSupportedRelease;
	}

	public VersionType getCdma2000onexSupportedRelease() {
		return cdma2000onexSupportedRelease;
	}

	public void setCdma2000hrpdSupportedRelease(VersionType cdma2000hrpdSupportedRelease) {
		this.cdma2000hrpdSupportedRelease = cdma2000hrpdSupportedRelease;
	}

	public VersionType getCdma2000hrpdSupportedRelease() {
		return cdma2000hrpdSupportedRelease;
	}

	public void setCdma2000ehrpdSupportedRelease(VersionType cdma2000ehrpdSupportedRelease) {
		this.cdma2000ehrpdSupportedRelease = cdma2000ehrpdSupportedRelease;
	}

	public VersionType getCdma2000ehrpdSupportedRelease() {
		return cdma2000ehrpdSupportedRelease;
	}

	public void setEutranEpcSupportedRelease(VersionType eutranEpcSupportedRelease) {
		this.eutranEpcSupportedRelease = eutranEpcSupportedRelease;
	}

	public VersionType getEutranEpcSupportedRelease() {
		return eutranEpcSupportedRelease;
	}

	public void setContactlessSupportedRelease(VersionType contactlessSupportedRelease) {
		this.contactlessSupportedRelease = contactlessSupportedRelease;
	}

	public VersionType getContactlessSupportedRelease() {
		return contactlessSupportedRelease;
	}

	public void setRspCrlSupportedVersion(VersionType rspCrlSupportedVersion) {
		this.rspCrlSupportedVersion = rspCrlSupportedVersion;
	}

	public VersionType getRspCrlSupportedVersion() {
		return rspCrlSupportedVersion;
	}

	public void setNrEpcSupportedRelease(VersionType nrEpcSupportedRelease) {
		this.nrEpcSupportedRelease = nrEpcSupportedRelease;
	}

	public VersionType getNrEpcSupportedRelease() {
		return nrEpcSupportedRelease;
	}

	public void setNr5gcSupportedRelease(VersionType nr5gcSupportedRelease) {
		this.nr5gcSupportedRelease = nr5gcSupportedRelease;
	}

	public VersionType getNr5gcSupportedRelease() {
		return nr5gcSupportedRelease;
	}

	public void setEutran5gcSupportedRelease(VersionType eutran5gcSupportedRelease) {
		this.eutran5gcSupportedRelease = eutran5gcSupportedRelease;
	}

	public VersionType getEutran5gcSupportedRelease() {
		return eutran5gcSupportedRelease;
	}

	public void setLpaSvn(VersionType lpaSvn) {
		this.lpaSvn = lpaSvn;
	}

	public VersionType getLpaSvn() {
		return lpaSvn;
	}

	public void setCatSupportedClasses(CatSupportedClasses catSupportedClasses) {
		this.catSupportedClasses = catSupportedClasses;
	}

	public CatSupportedClasses getCatSupportedClasses() {
		return catSupportedClasses;
	}

	public void setEuiccFormFactorType(EuiccFormFactorType euiccFormFactorType) {
		this.euiccFormFactorType = euiccFormFactorType;
	}

	public EuiccFormFactorType getEuiccFormFactorType() {
		return euiccFormFactorType;
	}

	public void setDeviceAdditionalFeatureSupport(DeviceAdditionalFeatureSupport deviceAdditionalFeatureSupport) {
		this.deviceAdditionalFeatureSupport = deviceAdditionalFeatureSupport;
	}

	public DeviceAdditionalFeatureSupport getDeviceAdditionalFeatureSupport() {
		return deviceAdditionalFeatureSupport;
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
		if (deviceAdditionalFeatureSupport != null) {
			codeLength += deviceAdditionalFeatureSupport.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 14
			reverseOS.write(0xAE);
			codeLength += 1;
		}
		
		if (euiccFormFactorType != null) {
			codeLength += euiccFormFactorType.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, PRIMITIVE, 13
			reverseOS.write(0x8D);
			codeLength += 1;
		}
		
		if (catSupportedClasses != null) {
			codeLength += catSupportedClasses.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, PRIMITIVE, 12
			reverseOS.write(0x8C);
			codeLength += 1;
		}
		
		if (lpaSvn != null) {
			codeLength += lpaSvn.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, PRIMITIVE, 11
			reverseOS.write(0x8B);
			codeLength += 1;
		}
		
		if (eutran5gcSupportedRelease != null) {
			codeLength += eutran5gcSupportedRelease.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, PRIMITIVE, 10
			reverseOS.write(0x8A);
			codeLength += 1;
		}
		
		if (nr5gcSupportedRelease != null) {
			codeLength += nr5gcSupportedRelease.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, PRIMITIVE, 9
			reverseOS.write(0x89);
			codeLength += 1;
		}
		
		if (nrEpcSupportedRelease != null) {
			codeLength += nrEpcSupportedRelease.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, PRIMITIVE, 8
			reverseOS.write(0x88);
			codeLength += 1;
		}
		
		if (rspCrlSupportedVersion != null) {
			codeLength += rspCrlSupportedVersion.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, PRIMITIVE, 7
			reverseOS.write(0x87);
			codeLength += 1;
		}
		
		if (contactlessSupportedRelease != null) {
			codeLength += contactlessSupportedRelease.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, PRIMITIVE, 6
			reverseOS.write(0x86);
			codeLength += 1;
		}
		
		if (eutranEpcSupportedRelease != null) {
			codeLength += eutranEpcSupportedRelease.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, PRIMITIVE, 5
			reverseOS.write(0x85);
			codeLength += 1;
		}
		
		if (cdma2000ehrpdSupportedRelease != null) {
			codeLength += cdma2000ehrpdSupportedRelease.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, PRIMITIVE, 4
			reverseOS.write(0x84);
			codeLength += 1;
		}
		
		if (cdma2000hrpdSupportedRelease != null) {
			codeLength += cdma2000hrpdSupportedRelease.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, PRIMITIVE, 3
			reverseOS.write(0x83);
			codeLength += 1;
		}
		
		if (cdma2000onexSupportedRelease != null) {
			codeLength += cdma2000onexSupportedRelease.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, PRIMITIVE, 2
			reverseOS.write(0x82);
			codeLength += 1;
		}
		
		if (utranSupportedRelease != null) {
			codeLength += utranSupportedRelease.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, PRIMITIVE, 1
			reverseOS.write(0x81);
			codeLength += 1;
		}
		
		if (gsmSupportedRelease != null) {
			codeLength += gsmSupportedRelease.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, PRIMITIVE, 0
			reverseOS.write(0x80);
			codeLength += 1;
		}
		
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

		if (totalLength == 0) {
			return codeLength;
		}
		subCodeLength += berTag.decode(is);
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 0)) {
			gsmSupportedRelease = new VersionType();
			subCodeLength += gsmSupportedRelease.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 1)) {
			utranSupportedRelease = new VersionType();
			subCodeLength += utranSupportedRelease.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 2)) {
			cdma2000onexSupportedRelease = new VersionType();
			subCodeLength += cdma2000onexSupportedRelease.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 3)) {
			cdma2000hrpdSupportedRelease = new VersionType();
			subCodeLength += cdma2000hrpdSupportedRelease.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 4)) {
			cdma2000ehrpdSupportedRelease = new VersionType();
			subCodeLength += cdma2000ehrpdSupportedRelease.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 5)) {
			eutranEpcSupportedRelease = new VersionType();
			subCodeLength += eutranEpcSupportedRelease.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 6)) {
			contactlessSupportedRelease = new VersionType();
			subCodeLength += contactlessSupportedRelease.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 7)) {
			rspCrlSupportedVersion = new VersionType();
			subCodeLength += rspCrlSupportedVersion.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 8)) {
			nrEpcSupportedRelease = new VersionType();
			subCodeLength += nrEpcSupportedRelease.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 9)) {
			nr5gcSupportedRelease = new VersionType();
			subCodeLength += nr5gcSupportedRelease.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 10)) {
			eutran5gcSupportedRelease = new VersionType();
			subCodeLength += eutran5gcSupportedRelease.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 11)) {
			lpaSvn = new VersionType();
			subCodeLength += lpaSvn.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 12)) {
			catSupportedClasses = new CatSupportedClasses();
			subCodeLength += catSupportedClasses.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 13)) {
			euiccFormFactorType = new EuiccFormFactorType();
			subCodeLength += euiccFormFactorType.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 14)) {
			deviceAdditionalFeatureSupport = new DeviceAdditionalFeatureSupport();
			subCodeLength += deviceAdditionalFeatureSupport.decode(is, false);
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
		boolean firstSelectedElement = true;
		if (gsmSupportedRelease != null) {
			sb.append("\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("gsmSupportedRelease: ").append(gsmSupportedRelease);
			firstSelectedElement = false;
		}
		
		if (utranSupportedRelease != null) {
			if (!firstSelectedElement) {
				sb.append(",\n");
			}
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("utranSupportedRelease: ").append(utranSupportedRelease);
			firstSelectedElement = false;
		}
		
		if (cdma2000onexSupportedRelease != null) {
			if (!firstSelectedElement) {
				sb.append(",\n");
			}
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("cdma2000onexSupportedRelease: ").append(cdma2000onexSupportedRelease);
			firstSelectedElement = false;
		}
		
		if (cdma2000hrpdSupportedRelease != null) {
			if (!firstSelectedElement) {
				sb.append(",\n");
			}
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("cdma2000hrpdSupportedRelease: ").append(cdma2000hrpdSupportedRelease);
			firstSelectedElement = false;
		}
		
		if (cdma2000ehrpdSupportedRelease != null) {
			if (!firstSelectedElement) {
				sb.append(",\n");
			}
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("cdma2000ehrpdSupportedRelease: ").append(cdma2000ehrpdSupportedRelease);
			firstSelectedElement = false;
		}
		
		if (eutranEpcSupportedRelease != null) {
			if (!firstSelectedElement) {
				sb.append(",\n");
			}
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("eutranEpcSupportedRelease: ").append(eutranEpcSupportedRelease);
			firstSelectedElement = false;
		}
		
		if (contactlessSupportedRelease != null) {
			if (!firstSelectedElement) {
				sb.append(",\n");
			}
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("contactlessSupportedRelease: ").append(contactlessSupportedRelease);
			firstSelectedElement = false;
		}
		
		if (rspCrlSupportedVersion != null) {
			if (!firstSelectedElement) {
				sb.append(",\n");
			}
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("rspCrlSupportedVersion: ").append(rspCrlSupportedVersion);
			firstSelectedElement = false;
		}
		
		if (nrEpcSupportedRelease != null) {
			if (!firstSelectedElement) {
				sb.append(",\n");
			}
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("nrEpcSupportedRelease: ").append(nrEpcSupportedRelease);
			firstSelectedElement = false;
		}
		
		if (nr5gcSupportedRelease != null) {
			if (!firstSelectedElement) {
				sb.append(",\n");
			}
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("nr5gcSupportedRelease: ").append(nr5gcSupportedRelease);
			firstSelectedElement = false;
		}
		
		if (eutran5gcSupportedRelease != null) {
			if (!firstSelectedElement) {
				sb.append(",\n");
			}
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("eutran5gcSupportedRelease: ").append(eutran5gcSupportedRelease);
			firstSelectedElement = false;
		}
		
		if (lpaSvn != null) {
			if (!firstSelectedElement) {
				sb.append(",\n");
			}
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("lpaSvn: ").append(lpaSvn);
			firstSelectedElement = false;
		}
		
		if (catSupportedClasses != null) {
			if (!firstSelectedElement) {
				sb.append(",\n");
			}
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("catSupportedClasses: ").append(catSupportedClasses);
			firstSelectedElement = false;
		}
		
		if (euiccFormFactorType != null) {
			if (!firstSelectedElement) {
				sb.append(",\n");
			}
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("euiccFormFactorType: ").append(euiccFormFactorType);
			firstSelectedElement = false;
		}
		
		if (deviceAdditionalFeatureSupport != null) {
			if (!firstSelectedElement) {
				sb.append(",\n");
			}
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("deviceAdditionalFeatureSupport: ");
			deviceAdditionalFeatureSupport.appendAsString(sb, indentLevel + 1);
			firstSelectedElement = false;
		}
		
		sb.append("\n");
		for (int i = 0; i < indentLevel; i++) {
			sb.append("\t");
		}
		sb.append("}");
	}

}

