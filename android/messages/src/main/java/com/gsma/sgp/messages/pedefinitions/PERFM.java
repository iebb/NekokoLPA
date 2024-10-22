/**
 * This class file was automatically generated by asn1bean v1.11.3 (http://www.beanit.com)
 */

package com.gsma.sgp.messages.pedefinitions;

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


public class PERFM implements BerType, Serializable {

	private static final long serialVersionUID = 1L;

	public static class TarList implements BerType, Serializable {

		private static final long serialVersionUID = 1L;

		public static final BerTag tag = new BerTag(BerTag.UNIVERSAL_CLASS, BerTag.CONSTRUCTED, 16);
		public byte[] code = null;
		private List<BerOctetString> seqOf = null;

		public TarList() {
			seqOf = new ArrayList<BerOctetString>();
		}

		public TarList(byte[] code) {
			this.code = code;
		}

		public List<BerOctetString> getBerOctetString() {
			if (seqOf == null) {
				seqOf = new ArrayList<BerOctetString>();
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
				BerOctetString element = new BerOctetString();
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
				Iterator<BerOctetString> it = seqOf.iterator();
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

	public static final BerTag tag = new BerTag(BerTag.UNIVERSAL_CLASS, BerTag.CONSTRUCTED, 16);

	public byte[] code = null;
	private PEHeader rfmHeader = null;
	private ApplicationIdentifier instanceAID = null;
	private ApplicationIdentifier securityDomainAID = null;
	private TarList tarList = null;
	private BerOctetString minimumSecurityLevel = null;
	private BerOctetString uiccAccessDomain = null;
	private BerOctetString uiccAdminAccessDomain = null;
	private ADFRFMAccess adfRFMAccess = null;
	
	public PERFM() {
	}

	public PERFM(byte[] code) {
		this.code = code;
	}

	public void setRfmHeader(PEHeader rfmHeader) {
		this.rfmHeader = rfmHeader;
	}

	public PEHeader getRfmHeader() {
		return rfmHeader;
	}

	public void setInstanceAID(ApplicationIdentifier instanceAID) {
		this.instanceAID = instanceAID;
	}

	public ApplicationIdentifier getInstanceAID() {
		return instanceAID;
	}

	public void setSecurityDomainAID(ApplicationIdentifier securityDomainAID) {
		this.securityDomainAID = securityDomainAID;
	}

	public ApplicationIdentifier getSecurityDomainAID() {
		return securityDomainAID;
	}

	public void setTarList(TarList tarList) {
		this.tarList = tarList;
	}

	public TarList getTarList() {
		return tarList;
	}

	public void setMinimumSecurityLevel(BerOctetString minimumSecurityLevel) {
		this.minimumSecurityLevel = minimumSecurityLevel;
	}

	public BerOctetString getMinimumSecurityLevel() {
		return minimumSecurityLevel;
	}

	public void setUiccAccessDomain(BerOctetString uiccAccessDomain) {
		this.uiccAccessDomain = uiccAccessDomain;
	}

	public BerOctetString getUiccAccessDomain() {
		return uiccAccessDomain;
	}

	public void setUiccAdminAccessDomain(BerOctetString uiccAdminAccessDomain) {
		this.uiccAdminAccessDomain = uiccAdminAccessDomain;
	}

	public BerOctetString getUiccAdminAccessDomain() {
		return uiccAdminAccessDomain;
	}

	public void setAdfRFMAccess(ADFRFMAccess adfRFMAccess) {
		this.adfRFMAccess = adfRFMAccess;
	}

	public ADFRFMAccess getAdfRFMAccess() {
		return adfRFMAccess;
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
		if (adfRFMAccess != null) {
			codeLength += adfRFMAccess.encode(reverseOS, true);
		}
		
		codeLength += uiccAdminAccessDomain.encode(reverseOS, true);
		
		codeLength += uiccAccessDomain.encode(reverseOS, true);
		
		codeLength += minimumSecurityLevel.encode(reverseOS, false);
		// write tag: CONTEXT_CLASS, PRIMITIVE, 1
		reverseOS.write(0x81);
		codeLength += 1;
		
		if (tarList != null) {
			codeLength += tarList.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 0
			reverseOS.write(0xA0);
			codeLength += 1;
		}
		
		if (securityDomainAID != null) {
			codeLength += securityDomainAID.encode(reverseOS, false);
			// write tag: APPLICATION_CLASS, PRIMITIVE, 15
			reverseOS.write(0x4F);
			codeLength += 1;
		}
		
		codeLength += instanceAID.encode(reverseOS, false);
		// write tag: APPLICATION_CLASS, PRIMITIVE, 15
		reverseOS.write(0x4F);
		codeLength += 1;
		
		codeLength += rfmHeader.encode(reverseOS, false);
		// write tag: CONTEXT_CLASS, CONSTRUCTED, 0
		reverseOS.write(0xA0);
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
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 0)) {
			rfmHeader = new PEHeader();
			subCodeLength += rfmHeader.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(BerTag.APPLICATION_CLASS, BerTag.PRIMITIVE, 15)) {
			instanceAID = new ApplicationIdentifier();
			subCodeLength += instanceAID.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(BerTag.APPLICATION_CLASS, BerTag.PRIMITIVE, 15)) {
			securityDomainAID = new ApplicationIdentifier();
			subCodeLength += securityDomainAID.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 0)) {
			tarList = new TarList();
			subCodeLength += tarList.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 1)) {
			minimumSecurityLevel = new BerOctetString();
			subCodeLength += minimumSecurityLevel.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(BerOctetString.tag)) {
			uiccAccessDomain = new BerOctetString();
			subCodeLength += uiccAccessDomain.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(BerOctetString.tag)) {
			uiccAdminAccessDomain = new BerOctetString();
			subCodeLength += uiccAdminAccessDomain.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(ADFRFMAccess.tag)) {
			adfRFMAccess = new ADFRFMAccess();
			subCodeLength += adfRFMAccess.decode(is, false);
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
		if (rfmHeader != null) {
			sb.append("rfmHeader: ");
			rfmHeader.appendAsString(sb, indentLevel + 1);
		}
		else {
			sb.append("rfmHeader: <empty-required-field>");
		}
		
		sb.append(",\n");
		for (int i = 0; i < indentLevel + 1; i++) {
			sb.append("\t");
		}
		if (instanceAID != null) {
			sb.append("instanceAID: ").append(instanceAID);
		}
		else {
			sb.append("instanceAID: <empty-required-field>");
		}
		
		if (securityDomainAID != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("securityDomainAID: ").append(securityDomainAID);
		}
		
		if (tarList != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("tarList: ");
			tarList.appendAsString(sb, indentLevel + 1);
		}
		
		sb.append(",\n");
		for (int i = 0; i < indentLevel + 1; i++) {
			sb.append("\t");
		}
		if (minimumSecurityLevel != null) {
			sb.append("minimumSecurityLevel: ").append(minimumSecurityLevel);
		}
		else {
			sb.append("minimumSecurityLevel: <empty-required-field>");
		}
		
		sb.append(",\n");
		for (int i = 0; i < indentLevel + 1; i++) {
			sb.append("\t");
		}
		if (uiccAccessDomain != null) {
			sb.append("uiccAccessDomain: ").append(uiccAccessDomain);
		}
		else {
			sb.append("uiccAccessDomain: <empty-required-field>");
		}
		
		sb.append(",\n");
		for (int i = 0; i < indentLevel + 1; i++) {
			sb.append("\t");
		}
		if (uiccAdminAccessDomain != null) {
			sb.append("uiccAdminAccessDomain: ").append(uiccAdminAccessDomain);
		}
		else {
			sb.append("uiccAdminAccessDomain: <empty-required-field>");
		}
		
		if (adfRFMAccess != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("adfRFMAccess: ");
			adfRFMAccess.appendAsString(sb, indentLevel + 1);
		}
		
		sb.append("\n");
		for (int i = 0; i < indentLevel; i++) {
			sb.append("\t");
		}
		sb.append("}");
	}

}

