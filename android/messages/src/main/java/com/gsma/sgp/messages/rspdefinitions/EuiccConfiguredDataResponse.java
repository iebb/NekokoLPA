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

public class EuiccConfiguredDataResponse implements BerType, Serializable {

	private static final long serialVersionUID = 1L;

	public static class AdditionalRootDsAddresses implements BerType, Serializable {

		private static final long serialVersionUID = 1L;

		public static final BerTag tag = new BerTag(BerTag.UNIVERSAL_CLASS, BerTag.CONSTRUCTED, 16);
		public byte[] code = null;
		private List<BerUTF8String> seqOf = null;

		public AdditionalRootDsAddresses() {
			seqOf = new ArrayList<BerUTF8String>();
		}

		public AdditionalRootDsAddresses(byte[] code) {
			this.code = code;
		}

		public List<BerUTF8String> getBerUTF8String() {
			if (seqOf == null) {
				seqOf = new ArrayList<BerUTF8String>();
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
				BerUTF8String element = new BerUTF8String();
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
				Iterator<BerUTF8String> it = seqOf.iterator();
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

	public static class CiList implements BerType, Serializable {

		private static final long serialVersionUID = 1L;

		public static class SEQUENCE implements BerType, Serializable {

			private static final long serialVersionUID = 1L;

			public static final BerTag tag = new BerTag(BerTag.UNIVERSAL_CLASS, BerTag.CONSTRUCTED, 16);

			public byte[] code = null;
			private SubjectKeyIdentifier ciPKId = null;
			private BerUTF8String ciName = null;
			
			public SEQUENCE() {
			}

			public SEQUENCE(byte[] code) {
				this.code = code;
			}

			public void setCiPKId(SubjectKeyIdentifier ciPKId) {
				this.ciPKId = ciPKId;
			}

			public SubjectKeyIdentifier getCiPKId() {
				return ciPKId;
			}

			public void setCiName(BerUTF8String ciName) {
				this.ciName = ciName;
			}

			public BerUTF8String getCiName() {
				return ciName;
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
				codeLength += ciName.encode(reverseOS, false);
				// write tag: CONTEXT_CLASS, PRIMITIVE, 1
				reverseOS.write(0x81);
				codeLength += 1;
				
				codeLength += ciPKId.encode(reverseOS, false);
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
					ciPKId = new SubjectKeyIdentifier();
					subCodeLength += ciPKId.decode(is, false);
					subCodeLength += berTag.decode(is);
				}
				else {
					throw new IOException("Tag does not match the mandatory sequence element tag.");
				}
				
				if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 1)) {
					ciName = new BerUTF8String();
					subCodeLength += ciName.decode(is, false);
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
				if (ciPKId != null) {
					sb.append("ciPKId: ").append(ciPKId);
				}
				else {
					sb.append("ciPKId: <empty-required-field>");
				}
				
				sb.append(",\n");
				for (int i = 0; i < indentLevel + 1; i++) {
					sb.append("\t");
				}
				if (ciName != null) {
					sb.append("ciName: ").append(ciName);
				}
				else {
					sb.append("ciName: <empty-required-field>");
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
		private List<SEQUENCE> seqOf = null;

		public CiList() {
			seqOf = new ArrayList<SEQUENCE>();
		}

		public CiList(byte[] code) {
			this.code = code;
		}

		public List<SEQUENCE> getSEQUENCE() {
			if (seqOf == null) {
				seqOf = new ArrayList<SEQUENCE>();
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
				SEQUENCE element = new SEQUENCE();
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
				Iterator<SEQUENCE> it = seqOf.iterator();
				if (it.hasNext()) {
					it.next().appendAsString(sb, indentLevel + 1);
					while (it.hasNext()) {
						sb.append(",\n");
						for (int i = 0; i < indentLevel + 1; i++) {
							sb.append("\t");
						}
						it.next().appendAsString(sb, indentLevel + 1);
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

	public static final BerTag tag = new BerTag(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 60);

	public byte[] code = null;
	private BerUTF8String defaultDpAddress = null;
	private BerUTF8String rootDsAddress = null;
	private AdditionalRootDsAddresses additionalRootDsAddresses = null;
	private SubjectKeyIdentifier allowedCiPKId = null;
	private CiList ciList = null;
	
	public EuiccConfiguredDataResponse() {
	}

	public EuiccConfiguredDataResponse(byte[] code) {
		this.code = code;
	}

	public void setDefaultDpAddress(BerUTF8String defaultDpAddress) {
		this.defaultDpAddress = defaultDpAddress;
	}

	public BerUTF8String getDefaultDpAddress() {
		return defaultDpAddress;
	}

	public void setRootDsAddress(BerUTF8String rootDsAddress) {
		this.rootDsAddress = rootDsAddress;
	}

	public BerUTF8String getRootDsAddress() {
		return rootDsAddress;
	}

	public void setAdditionalRootDsAddresses(AdditionalRootDsAddresses additionalRootDsAddresses) {
		this.additionalRootDsAddresses = additionalRootDsAddresses;
	}

	public AdditionalRootDsAddresses getAdditionalRootDsAddresses() {
		return additionalRootDsAddresses;
	}

	public void setAllowedCiPKId(SubjectKeyIdentifier allowedCiPKId) {
		this.allowedCiPKId = allowedCiPKId;
	}

	public SubjectKeyIdentifier getAllowedCiPKId() {
		return allowedCiPKId;
	}

	public void setCiList(CiList ciList) {
		this.ciList = ciList;
	}

	public CiList getCiList() {
		return ciList;
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
		if (ciList != null) {
			codeLength += ciList.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 4
			reverseOS.write(0xA4);
			codeLength += 1;
		}
		
		if (allowedCiPKId != null) {
			codeLength += allowedCiPKId.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, PRIMITIVE, 3
			reverseOS.write(0x83);
			codeLength += 1;
		}
		
		if (additionalRootDsAddresses != null) {
			codeLength += additionalRootDsAddresses.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 2
			reverseOS.write(0xA2);
			codeLength += 1;
		}
		
		codeLength += rootDsAddress.encode(reverseOS, false);
		// write tag: CONTEXT_CLASS, PRIMITIVE, 1
		reverseOS.write(0x81);
		codeLength += 1;
		
		if (defaultDpAddress != null) {
			codeLength += defaultDpAddress.encode(reverseOS, false);
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

		subCodeLength += berTag.decode(is);
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 0)) {
			defaultDpAddress = new BerUTF8String();
			subCodeLength += defaultDpAddress.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 1)) {
			rootDsAddress = new BerUTF8String();
			subCodeLength += rootDsAddress.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 2)) {
			additionalRootDsAddresses = new AdditionalRootDsAddresses();
			subCodeLength += additionalRootDsAddresses.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 3)) {
			allowedCiPKId = new SubjectKeyIdentifier();
			subCodeLength += allowedCiPKId.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 4)) {
			ciList = new CiList();
			subCodeLength += ciList.decode(is, false);
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
		if (defaultDpAddress != null) {
			sb.append("\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("defaultDpAddress: ").append(defaultDpAddress);
			firstSelectedElement = false;
		}
		
		if (!firstSelectedElement) {
			sb.append(",\n");
		}
		for (int i = 0; i < indentLevel + 1; i++) {
			sb.append("\t");
		}
		if (rootDsAddress != null) {
			sb.append("rootDsAddress: ").append(rootDsAddress);
		}
		else {
			sb.append("rootDsAddress: <empty-required-field>");
		}
		
		if (additionalRootDsAddresses != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("additionalRootDsAddresses: ");
			additionalRootDsAddresses.appendAsString(sb, indentLevel + 1);
		}
		
		if (allowedCiPKId != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("allowedCiPKId: ").append(allowedCiPKId);
		}
		
		if (ciList != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("ciList: ");
			ciList.appendAsString(sb, indentLevel + 1);
		}
		
		sb.append("\n");
		for (int i = 0; i < indentLevel; i++) {
			sb.append("\t");
		}
		sb.append("}");
	}

}

