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

public class EUICCInfo2 implements BerType, Serializable {

	private static final long serialVersionUID = 1L;

	public static class EuiccCiPKIdListForVerification implements BerType, Serializable {

		private static final long serialVersionUID = 1L;

		public static final BerTag tag = new BerTag(BerTag.UNIVERSAL_CLASS, BerTag.CONSTRUCTED, 16);
		public byte[] code = null;
		private List<SubjectKeyIdentifier> seqOf = null;

		public EuiccCiPKIdListForVerification() {
			seqOf = new ArrayList<SubjectKeyIdentifier>();
		}

		public EuiccCiPKIdListForVerification(byte[] code) {
			this.code = code;
		}

		public List<SubjectKeyIdentifier> getSubjectKeyIdentifier() {
			if (seqOf == null) {
				seqOf = new ArrayList<SubjectKeyIdentifier>();
			}
			return seqOf;
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
			for (int i = (seqOf.size() - 1); i >= 0; i--) {
				codeLength += seqOf.get(i).encode(reverseOS, true);
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
			if (withTag) {
				codeLength += tag.decodeAndCheck(is);
			}

			BerLength length = new BerLength();
			codeLength += length.decode(is);
			int totalLength = length.val;

			while (subCodeLength < totalLength) {
				SubjectKeyIdentifier element = new SubjectKeyIdentifier();
				subCodeLength += element.decode(is, true);
				seqOf.add(element);
			}
			if (subCodeLength != totalLength) {
				throw new IOException("Decoded SequenceOf or SetOf has wrong length. Expected " + totalLength + " but has " + subCodeLength);

			}
			codeLength += subCodeLength;

			return codeLength;
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

			sb.append("{\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			if (seqOf == null) {
				sb.append("null");
			}
			else {
				Iterator<SubjectKeyIdentifier> it = seqOf.iterator();
				if (it.hasNext()) {
					sb.append(it.next());
					while (it.hasNext()) {
						sb.append(",\n");
						for (int i = 0; i < indentLevel + 1; i++) {
							sb.append("\t");
						}
						sb.append(it.next());
					}
				}
			}

			sb.append("\n");
			for (int i = 0; i < indentLevel; i++) {
				sb.append("\t");
			}
			sb.append("}");
		}

	}

	public static class EuiccCiPKIdListForSigning implements BerType, Serializable {

		private static final long serialVersionUID = 1L;

		public static final BerTag tag = new BerTag(BerTag.UNIVERSAL_CLASS, BerTag.CONSTRUCTED, 16);
		public byte[] code = null;
		private List<SubjectKeyIdentifier> seqOf = null;

		public EuiccCiPKIdListForSigning() {
			seqOf = new ArrayList<SubjectKeyIdentifier>();
		}

		public EuiccCiPKIdListForSigning(byte[] code) {
			this.code = code;
		}

		public List<SubjectKeyIdentifier> getSubjectKeyIdentifier() {
			if (seqOf == null) {
				seqOf = new ArrayList<SubjectKeyIdentifier>();
			}
			return seqOf;
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
			for (int i = (seqOf.size() - 1); i >= 0; i--) {
				codeLength += seqOf.get(i).encode(reverseOS, true);
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
			if (withTag) {
				codeLength += tag.decodeAndCheck(is);
			}

			BerLength length = new BerLength();
			codeLength += length.decode(is);
			int totalLength = length.val;

			while (subCodeLength < totalLength) {
				SubjectKeyIdentifier element = new SubjectKeyIdentifier();
				subCodeLength += element.decode(is, true);
				seqOf.add(element);
			}
			if (subCodeLength != totalLength) {
				throw new IOException("Decoded SequenceOf or SetOf has wrong length. Expected " + totalLength + " but has " + subCodeLength);

			}
			codeLength += subCodeLength;

			return codeLength;
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

			sb.append("{\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			if (seqOf == null) {
				sb.append("null");
			}
			else {
				Iterator<SubjectKeyIdentifier> it = seqOf.iterator();
				if (it.hasNext()) {
					sb.append(it.next());
					while (it.hasNext()) {
						sb.append(",\n");
						for (int i = 0; i < indentLevel + 1; i++) {
							sb.append("\t");
						}
						sb.append(it.next());
					}
				}
			}

			sb.append("\n");
			for (int i = 0; i < indentLevel; i++) {
				sb.append("\t");
			}
			sb.append("}");
		}

	}

	public static class AdditionalProfilePackageVersions implements BerType, Serializable {

		private static final long serialVersionUID = 1L;

		public static final BerTag tag = new BerTag(BerTag.UNIVERSAL_CLASS, BerTag.CONSTRUCTED, 16);
		public byte[] code = null;
		private List<VersionType> seqOf = null;

		public AdditionalProfilePackageVersions() {
			seqOf = new ArrayList<VersionType>();
		}

		public AdditionalProfilePackageVersions(byte[] code) {
			this.code = code;
		}

		public List<VersionType> getVersionType() {
			if (seqOf == null) {
				seqOf = new ArrayList<VersionType>();
			}
			return seqOf;
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
			for (int i = (seqOf.size() - 1); i >= 0; i--) {
				codeLength += seqOf.get(i).encode(reverseOS, true);
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
			if (withTag) {
				codeLength += tag.decodeAndCheck(is);
			}

			BerLength length = new BerLength();
			codeLength += length.decode(is);
			int totalLength = length.val;

			while (subCodeLength < totalLength) {
				VersionType element = new VersionType();
				subCodeLength += element.decode(is, true);
				seqOf.add(element);
			}
			if (subCodeLength != totalLength) {
				throw new IOException("Decoded SequenceOf or SetOf has wrong length. Expected " + totalLength + " but has " + subCodeLength);

			}
			codeLength += subCodeLength;

			return codeLength;
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

			sb.append("{\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			if (seqOf == null) {
				sb.append("null");
			}
			else {
				Iterator<VersionType> it = seqOf.iterator();
				if (it.hasNext()) {
					sb.append(it.next());
					while (it.hasNext()) {
						sb.append(",\n");
						for (int i = 0; i < indentLevel + 1; i++) {
							sb.append("\t");
						}
						sb.append(it.next());
					}
				}
			}

			sb.append("\n");
			for (int i = 0; i < indentLevel; i++) {
				sb.append("\t");
			}
			sb.append("}");
		}

	}

	public static class EuiccCiPKIdListForSigningV3 implements BerType, Serializable {

		private static final long serialVersionUID = 1L;

		public static final BerTag tag = new BerTag(BerTag.UNIVERSAL_CLASS, BerTag.CONSTRUCTED, 16);
		public byte[] code = null;
		private List<SubjectKeyIdentifier> seqOf = null;

		public EuiccCiPKIdListForSigningV3() {
			seqOf = new ArrayList<SubjectKeyIdentifier>();
		}

		public EuiccCiPKIdListForSigningV3(byte[] code) {
			this.code = code;
		}

		public List<SubjectKeyIdentifier> getSubjectKeyIdentifier() {
			if (seqOf == null) {
				seqOf = new ArrayList<SubjectKeyIdentifier>();
			}
			return seqOf;
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
			for (int i = (seqOf.size() - 1); i >= 0; i--) {
				codeLength += seqOf.get(i).encode(reverseOS, true);
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
			if (withTag) {
				codeLength += tag.decodeAndCheck(is);
			}

			BerLength length = new BerLength();
			codeLength += length.decode(is);
			int totalLength = length.val;

			while (subCodeLength < totalLength) {
				SubjectKeyIdentifier element = new SubjectKeyIdentifier();
				subCodeLength += element.decode(is, true);
				seqOf.add(element);
			}
			if (subCodeLength != totalLength) {
				throw new IOException("Decoded SequenceOf or SetOf has wrong length. Expected " + totalLength + " but has " + subCodeLength);

			}
			codeLength += subCodeLength;

			return codeLength;
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

			sb.append("{\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			if (seqOf == null) {
				sb.append("null");
			}
			else {
				Iterator<SubjectKeyIdentifier> it = seqOf.iterator();
				if (it.hasNext()) {
					sb.append(it.next());
					while (it.hasNext()) {
						sb.append(",\n");
						for (int i = 0; i < indentLevel + 1; i++) {
							sb.append("\t");
						}
						sb.append(it.next());
					}
				}
			}

			sb.append("\n");
			for (int i = 0; i < indentLevel; i++) {
				sb.append("\t");
			}
			sb.append("}");
		}

	}

	public static final BerTag tag = new BerTag(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 34);

	public byte[] code = null;
	private VersionType baseProfilePackageVersion = null;
	private VersionType lowestSvn = null;
	private VersionType euiccFirmwareVersion = null;
	private BerOctetString extCardResource = null;
	private UICCCapability uiccCapability = null;
	private VersionType ts102241Version = null;
	private VersionType globalplatformVersion = null;
	private EuiccRspCapability euiccRspCapability = null;
	private EuiccCiPKIdListForVerification euiccCiPKIdListForVerification = null;
	private EuiccCiPKIdListForSigning euiccCiPKIdListForSigning = null;
	private BerInteger euiccCategory = null;
	private PprIds forbiddenProfilePolicyRules = null;
	private VersionType ppVersion = null;
	private BerUTF8String sasAcreditationNumber = null;
	private CertificationDataObject certificationDataObject = null;
	private BerBitString treProperties = null;
	private BerUTF8String treProductReference = null;
	private AdditionalProfilePackageVersions additionalProfilePackageVersions = null;
	private LpaMode lpaMode = null;
	private EuiccCiPKIdListForSigningV3 euiccCiPKIdListForSigningV3 = null;
	private BerOctetString additionalEuiccInfo = null;
	private VersionType highestSvn = null;
	private IoTSpecificInfo iotSpecificInfo = null;
	
	public EUICCInfo2() {
	}

	public EUICCInfo2(byte[] code) {
		this.code = code;
	}

	public void setBaseProfilePackageVersion(VersionType baseProfilePackageVersion) {
		this.baseProfilePackageVersion = baseProfilePackageVersion;
	}

	public VersionType getBaseProfilePackageVersion() {
		return baseProfilePackageVersion;
	}

	public void setLowestSvn(VersionType lowestSvn) {
		this.lowestSvn = lowestSvn;
	}

	public VersionType getLowestSvn() {
		return lowestSvn;
	}

	public void setEuiccFirmwareVersion(VersionType euiccFirmwareVersion) {
		this.euiccFirmwareVersion = euiccFirmwareVersion;
	}

	public VersionType getEuiccFirmwareVersion() {
		return euiccFirmwareVersion;
	}

	public void setExtCardResource(BerOctetString extCardResource) {
		this.extCardResource = extCardResource;
	}

	public BerOctetString getExtCardResource() {
		return extCardResource;
	}

	public void setUiccCapability(UICCCapability uiccCapability) {
		this.uiccCapability = uiccCapability;
	}

	public UICCCapability getUiccCapability() {
		return uiccCapability;
	}

	public void setTs102241Version(VersionType ts102241Version) {
		this.ts102241Version = ts102241Version;
	}

	public VersionType getTs102241Version() {
		return ts102241Version;
	}

	public void setGlobalplatformVersion(VersionType globalplatformVersion) {
		this.globalplatformVersion = globalplatformVersion;
	}

	public VersionType getGlobalplatformVersion() {
		return globalplatformVersion;
	}

	public void setEuiccRspCapability(EuiccRspCapability euiccRspCapability) {
		this.euiccRspCapability = euiccRspCapability;
	}

	public EuiccRspCapability getEuiccRspCapability() {
		return euiccRspCapability;
	}

	public void setEuiccCiPKIdListForVerification(EuiccCiPKIdListForVerification euiccCiPKIdListForVerification) {
		this.euiccCiPKIdListForVerification = euiccCiPKIdListForVerification;
	}

	public EuiccCiPKIdListForVerification getEuiccCiPKIdListForVerification() {
		return euiccCiPKIdListForVerification;
	}

	public void setEuiccCiPKIdListForSigning(EuiccCiPKIdListForSigning euiccCiPKIdListForSigning) {
		this.euiccCiPKIdListForSigning = euiccCiPKIdListForSigning;
	}

	public EuiccCiPKIdListForSigning getEuiccCiPKIdListForSigning() {
		return euiccCiPKIdListForSigning;
	}

	public void setEuiccCategory(BerInteger euiccCategory) {
		this.euiccCategory = euiccCategory;
	}

	public BerInteger getEuiccCategory() {
		return euiccCategory;
	}

	public void setForbiddenProfilePolicyRules(PprIds forbiddenProfilePolicyRules) {
		this.forbiddenProfilePolicyRules = forbiddenProfilePolicyRules;
	}

	public PprIds getForbiddenProfilePolicyRules() {
		return forbiddenProfilePolicyRules;
	}

	public void setPpVersion(VersionType ppVersion) {
		this.ppVersion = ppVersion;
	}

	public VersionType getPpVersion() {
		return ppVersion;
	}

	public void setSasAcreditationNumber(BerUTF8String sasAcreditationNumber) {
		this.sasAcreditationNumber = sasAcreditationNumber;
	}

	public BerUTF8String getSasAcreditationNumber() {
		return sasAcreditationNumber;
	}

	public void setCertificationDataObject(CertificationDataObject certificationDataObject) {
		this.certificationDataObject = certificationDataObject;
	}

	public CertificationDataObject getCertificationDataObject() {
		return certificationDataObject;
	}

	public void setTreProperties(BerBitString treProperties) {
		this.treProperties = treProperties;
	}

	public BerBitString getTreProperties() {
		return treProperties;
	}

	public void setTreProductReference(BerUTF8String treProductReference) {
		this.treProductReference = treProductReference;
	}

	public BerUTF8String getTreProductReference() {
		return treProductReference;
	}

	public void setAdditionalProfilePackageVersions(AdditionalProfilePackageVersions additionalProfilePackageVersions) {
		this.additionalProfilePackageVersions = additionalProfilePackageVersions;
	}

	public AdditionalProfilePackageVersions getAdditionalProfilePackageVersions() {
		return additionalProfilePackageVersions;
	}

	public void setLpaMode(LpaMode lpaMode) {
		this.lpaMode = lpaMode;
	}

	public LpaMode getLpaMode() {
		return lpaMode;
	}

	public void setEuiccCiPKIdListForSigningV3(EuiccCiPKIdListForSigningV3 euiccCiPKIdListForSigningV3) {
		this.euiccCiPKIdListForSigningV3 = euiccCiPKIdListForSigningV3;
	}

	public EuiccCiPKIdListForSigningV3 getEuiccCiPKIdListForSigningV3() {
		return euiccCiPKIdListForSigningV3;
	}

	public void setAdditionalEuiccInfo(BerOctetString additionalEuiccInfo) {
		this.additionalEuiccInfo = additionalEuiccInfo;
	}

	public BerOctetString getAdditionalEuiccInfo() {
		return additionalEuiccInfo;
	}

	public void setHighestSvn(VersionType highestSvn) {
		this.highestSvn = highestSvn;
	}

	public VersionType getHighestSvn() {
		return highestSvn;
	}

	public void setIotSpecificInfo(IoTSpecificInfo iotSpecificInfo) {
		this.iotSpecificInfo = iotSpecificInfo;
	}

	public IoTSpecificInfo getIotSpecificInfo() {
		return iotSpecificInfo;
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
		if (iotSpecificInfo != null) {
			codeLength += iotSpecificInfo.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 20
			reverseOS.write(0xB4);
			codeLength += 1;
		}
		
		if (highestSvn != null) {
			codeLength += highestSvn.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, PRIMITIVE, 19
			reverseOS.write(0x93);
			codeLength += 1;
		}
		
		if (additionalEuiccInfo != null) {
			codeLength += additionalEuiccInfo.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, PRIMITIVE, 18
			reverseOS.write(0x92);
			codeLength += 1;
		}
		
		if (euiccCiPKIdListForSigningV3 != null) {
			codeLength += euiccCiPKIdListForSigningV3.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 17
			reverseOS.write(0xB1);
			codeLength += 1;
		}
		
		if (lpaMode != null) {
			codeLength += lpaMode.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, PRIMITIVE, 16
			reverseOS.write(0x90);
			codeLength += 1;
		}
		
		if (additionalProfilePackageVersions != null) {
			codeLength += additionalProfilePackageVersions.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 15
			reverseOS.write(0xAF);
			codeLength += 1;
		}
		
		if (treProductReference != null) {
			codeLength += treProductReference.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, PRIMITIVE, 14
			reverseOS.write(0x8E);
			codeLength += 1;
		}
		
		if (treProperties != null) {
			codeLength += treProperties.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, PRIMITIVE, 13
			reverseOS.write(0x8D);
			codeLength += 1;
		}
		
		if (certificationDataObject != null) {
			codeLength += certificationDataObject.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 12
			reverseOS.write(0xAC);
			codeLength += 1;
		}
		
		codeLength += sasAcreditationNumber.encode(reverseOS, true);
		
		codeLength += ppVersion.encode(reverseOS, true);
		
		if (forbiddenProfilePolicyRules != null) {
			codeLength += forbiddenProfilePolicyRules.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, PRIMITIVE, 25
			reverseOS.write(0x99);
			codeLength += 1;
		}
		
		if (euiccCategory != null) {
			codeLength += euiccCategory.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, PRIMITIVE, 11
			reverseOS.write(0x8B);
			codeLength += 1;
		}
		
		codeLength += euiccCiPKIdListForSigning.encode(reverseOS, false);
		// write tag: CONTEXT_CLASS, CONSTRUCTED, 10
		reverseOS.write(0xAA);
		codeLength += 1;
		
		codeLength += euiccCiPKIdListForVerification.encode(reverseOS, false);
		// write tag: CONTEXT_CLASS, CONSTRUCTED, 9
		reverseOS.write(0xA9);
		codeLength += 1;
		
		codeLength += euiccRspCapability.encode(reverseOS, false);
		// write tag: CONTEXT_CLASS, PRIMITIVE, 8
		reverseOS.write(0x88);
		codeLength += 1;
		
		if (globalplatformVersion != null) {
			codeLength += globalplatformVersion.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, PRIMITIVE, 7
			reverseOS.write(0x87);
			codeLength += 1;
		}
		
		if (ts102241Version != null) {
			codeLength += ts102241Version.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, PRIMITIVE, 6
			reverseOS.write(0x86);
			codeLength += 1;
		}
		
		codeLength += uiccCapability.encode(reverseOS, false);
		// write tag: CONTEXT_CLASS, PRIMITIVE, 5
		reverseOS.write(0x85);
		codeLength += 1;
		
		codeLength += extCardResource.encode(reverseOS, false);
		// write tag: CONTEXT_CLASS, PRIMITIVE, 4
		reverseOS.write(0x84);
		codeLength += 1;
		
		codeLength += euiccFirmwareVersion.encode(reverseOS, false);
		// write tag: CONTEXT_CLASS, PRIMITIVE, 3
		reverseOS.write(0x83);
		codeLength += 1;
		
		codeLength += lowestSvn.encode(reverseOS, false);
		// write tag: CONTEXT_CLASS, PRIMITIVE, 2
		reverseOS.write(0x82);
		codeLength += 1;
		
		codeLength += baseProfilePackageVersion.encode(reverseOS, false);
		// write tag: CONTEXT_CLASS, PRIMITIVE, 1
		reverseOS.write(0x81);
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
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 1)) {
			baseProfilePackageVersion = new VersionType();
			subCodeLength += baseProfilePackageVersion.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 2)) {
			lowestSvn = new VersionType();
			subCodeLength += lowestSvn.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 3)) {
			euiccFirmwareVersion = new VersionType();
			subCodeLength += euiccFirmwareVersion.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 4)) {
			extCardResource = new BerOctetString();
			subCodeLength += extCardResource.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 5)) {
			uiccCapability = new UICCCapability();
			subCodeLength += uiccCapability.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 6)) {
			ts102241Version = new VersionType();
			subCodeLength += ts102241Version.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 7)) {
			globalplatformVersion = new VersionType();
			subCodeLength += globalplatformVersion.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 8)) {
			euiccRspCapability = new EuiccRspCapability();
			subCodeLength += euiccRspCapability.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 9)) {
			euiccCiPKIdListForVerification = new EuiccCiPKIdListForVerification();
			subCodeLength += euiccCiPKIdListForVerification.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 10)) {
			euiccCiPKIdListForSigning = new EuiccCiPKIdListForSigning();
			subCodeLength += euiccCiPKIdListForSigning.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 11)) {
			euiccCategory = new BerInteger();
			subCodeLength += euiccCategory.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 25)) {
			forbiddenProfilePolicyRules = new PprIds();
			subCodeLength += forbiddenProfilePolicyRules.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(VersionType.tag)) {
			ppVersion = new VersionType();
			subCodeLength += ppVersion.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(BerUTF8String.tag)) {
			sasAcreditationNumber = new BerUTF8String();
			subCodeLength += sasAcreditationNumber.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 12)) {
			certificationDataObject = new CertificationDataObject();
			subCodeLength += certificationDataObject.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 13)) {
			treProperties = new BerBitString();
			subCodeLength += treProperties.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 14)) {
			treProductReference = new BerUTF8String();
			subCodeLength += treProductReference.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 15)) {
			additionalProfilePackageVersions = new AdditionalProfilePackageVersions();
			subCodeLength += additionalProfilePackageVersions.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 16)) {
			lpaMode = new LpaMode();
			subCodeLength += lpaMode.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 17)) {
			euiccCiPKIdListForSigningV3 = new EuiccCiPKIdListForSigningV3();
			subCodeLength += euiccCiPKIdListForSigningV3.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 18)) {
			additionalEuiccInfo = new BerOctetString();
			subCodeLength += additionalEuiccInfo.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 19)) {
			highestSvn = new VersionType();
			subCodeLength += highestSvn.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 20)) {
			iotSpecificInfo = new IoTSpecificInfo();
			subCodeLength += iotSpecificInfo.decode(is, false);
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
		if (baseProfilePackageVersion != null) {
			sb.append("baseProfilePackageVersion: ").append(baseProfilePackageVersion);
		}
		else {
			sb.append("baseProfilePackageVersion: <empty-required-field>");
		}
		
		sb.append(",\n");
		for (int i = 0; i < indentLevel + 1; i++) {
			sb.append("\t");
		}
		if (lowestSvn != null) {
			sb.append("lowestSvn: ").append(lowestSvn);
		}
		else {
			sb.append("lowestSvn: <empty-required-field>");
		}
		
		sb.append(",\n");
		for (int i = 0; i < indentLevel + 1; i++) {
			sb.append("\t");
		}
		if (euiccFirmwareVersion != null) {
			sb.append("euiccFirmwareVersion: ").append(euiccFirmwareVersion);
		}
		else {
			sb.append("euiccFirmwareVersion: <empty-required-field>");
		}
		
		sb.append(",\n");
		for (int i = 0; i < indentLevel + 1; i++) {
			sb.append("\t");
		}
		if (extCardResource != null) {
			sb.append("extCardResource: ").append(extCardResource);
		}
		else {
			sb.append("extCardResource: <empty-required-field>");
		}
		
		sb.append(",\n");
		for (int i = 0; i < indentLevel + 1; i++) {
			sb.append("\t");
		}
		if (uiccCapability != null) {
			sb.append("uiccCapability: ").append(uiccCapability);
		}
		else {
			sb.append("uiccCapability: <empty-required-field>");
		}
		
		if (ts102241Version != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("ts102241Version: ").append(ts102241Version);
		}
		
		if (globalplatformVersion != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("globalplatformVersion: ").append(globalplatformVersion);
		}
		
		sb.append(",\n");
		for (int i = 0; i < indentLevel + 1; i++) {
			sb.append("\t");
		}
		if (euiccRspCapability != null) {
			sb.append("euiccRspCapability: ").append(euiccRspCapability);
		}
		else {
			sb.append("euiccRspCapability: <empty-required-field>");
		}
		
		sb.append(",\n");
		for (int i = 0; i < indentLevel + 1; i++) {
			sb.append("\t");
		}
		if (euiccCiPKIdListForVerification != null) {
			sb.append("euiccCiPKIdListForVerification: ");
			euiccCiPKIdListForVerification.appendAsString(sb, indentLevel + 1);
		}
		else {
			sb.append("euiccCiPKIdListForVerification: <empty-required-field>");
		}
		
		sb.append(",\n");
		for (int i = 0; i < indentLevel + 1; i++) {
			sb.append("\t");
		}
		if (euiccCiPKIdListForSigning != null) {
			sb.append("euiccCiPKIdListForSigning: ");
			euiccCiPKIdListForSigning.appendAsString(sb, indentLevel + 1);
		}
		else {
			sb.append("euiccCiPKIdListForSigning: <empty-required-field>");
		}
		
		if (euiccCategory != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("euiccCategory: ").append(euiccCategory);
		}
		
		if (forbiddenProfilePolicyRules != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("forbiddenProfilePolicyRules: ").append(forbiddenProfilePolicyRules);
		}
		
		sb.append(",\n");
		for (int i = 0; i < indentLevel + 1; i++) {
			sb.append("\t");
		}
		if (ppVersion != null) {
			sb.append("ppVersion: ").append(ppVersion);
		}
		else {
			sb.append("ppVersion: <empty-required-field>");
		}
		
		sb.append(",\n");
		for (int i = 0; i < indentLevel + 1; i++) {
			sb.append("\t");
		}
		if (sasAcreditationNumber != null) {
			sb.append("sasAcreditationNumber: ").append(sasAcreditationNumber);
		}
		else {
			sb.append("sasAcreditationNumber: <empty-required-field>");
		}
		
		if (certificationDataObject != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("certificationDataObject: ");
			certificationDataObject.appendAsString(sb, indentLevel + 1);
		}
		
		if (treProperties != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("treProperties: ").append(treProperties);
		}
		
		if (treProductReference != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("treProductReference: ").append(treProductReference);
		}
		
		if (additionalProfilePackageVersions != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("additionalProfilePackageVersions: ");
			additionalProfilePackageVersions.appendAsString(sb, indentLevel + 1);
		}
		
		if (lpaMode != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("lpaMode: ").append(lpaMode);
		}
		
		if (euiccCiPKIdListForSigningV3 != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("euiccCiPKIdListForSigningV3: ");
			euiccCiPKIdListForSigningV3.appendAsString(sb, indentLevel + 1);
		}
		
		if (additionalEuiccInfo != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("additionalEuiccInfo: ").append(additionalEuiccInfo);
		}
		
		if (highestSvn != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("highestSvn: ").append(highestSvn);
		}
		
		if (iotSpecificInfo != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("iotSpecificInfo: ");
			iotSpecificInfo.appendAsString(sb, indentLevel + 1);
		}
		
		sb.append("\n");
		for (int i = 0; i < indentLevel; i++) {
			sb.append("\t");
		}
		sb.append("}");
	}

}

