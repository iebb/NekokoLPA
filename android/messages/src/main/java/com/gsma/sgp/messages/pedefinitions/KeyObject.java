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


public class KeyObject implements BerType, Serializable {

	private static final long serialVersionUID = 1L;

	public static class KeyCompontents implements BerType, Serializable {

		private static final long serialVersionUID = 1L;

		public static class SEQUENCE implements BerType, Serializable {

			private static final long serialVersionUID = 1L;

			public static final BerTag tag = new BerTag(BerTag.UNIVERSAL_CLASS, BerTag.CONSTRUCTED, 16);

			public byte[] code = null;
			private BerOctetString keyType = null;
			private BerOctetString keyData = null;
			private UInt8 macLength = null;
			
			public SEQUENCE() {
			}

			public SEQUENCE(byte[] code) {
				this.code = code;
			}

			public void setKeyType(BerOctetString keyType) {
				this.keyType = keyType;
			}

			public BerOctetString getKeyType() {
				return keyType;
			}

			public void setKeyData(BerOctetString keyData) {
				this.keyData = keyData;
			}

			public BerOctetString getKeyData() {
				return keyData;
			}

			public void setMacLength(UInt8 macLength) {
				this.macLength = macLength;
			}

			public UInt8 getMacLength() {
				return macLength;
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
				if (macLength != null) {
					codeLength += macLength.encode(reverseOS, false);
					// write tag: CONTEXT_CLASS, PRIMITIVE, 7
					reverseOS.write(0x87);
					codeLength += 1;
				}
				
				codeLength += keyData.encode(reverseOS, false);
				// write tag: CONTEXT_CLASS, PRIMITIVE, 6
				reverseOS.write(0x86);
				codeLength += 1;
				
				codeLength += keyType.encode(reverseOS, false);
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
					keyType = new BerOctetString();
					subCodeLength += keyType.decode(is, false);
					subCodeLength += berTag.decode(is);
				}
				else {
					throw new IOException("Tag does not match the mandatory sequence element tag.");
				}
				
				if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 6)) {
					keyData = new BerOctetString();
					subCodeLength += keyData.decode(is, false);
					if (subCodeLength == totalLength) {
						return codeLength;
					}
					subCodeLength += berTag.decode(is);
				}
				else {
					throw new IOException("Tag does not match the mandatory sequence element tag.");
				}
				
				if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 7)) {
					macLength = new UInt8();
					subCodeLength += macLength.decode(is, false);
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
				if (keyType != null) {
					sb.append("keyType: ").append(keyType);
				}
				else {
					sb.append("keyType: <empty-required-field>");
				}
				
				sb.append(",\n");
				for (int i = 0; i < indentLevel + 1; i++) {
					sb.append("\t");
				}
				if (keyData != null) {
					sb.append("keyData: ").append(keyData);
				}
				else {
					sb.append("keyData: <empty-required-field>");
				}
				
				if (macLength != null) {
					sb.append(",\n");
					for (int i = 0; i < indentLevel + 1; i++) {
						sb.append("\t");
					}
					sb.append("macLength: ").append(macLength);
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

		public KeyCompontents() {
			seqOf = new ArrayList<SEQUENCE>();
		}

		public KeyCompontents(byte[] code) {
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

	public static final BerTag tag = new BerTag(BerTag.UNIVERSAL_CLASS, BerTag.CONSTRUCTED, 16);

	public byte[] code = null;
	private BerOctetString keyUsageQualifier = null;
	private BerOctetString keyAccess = null;
	private BerOctetString keyIdentifier = null;
	private BerOctetString keyVersionNumber = null;
	private BerOctetString keyCounterValue = null;
	private KeyCompontents keyCompontents = null;
	
	public KeyObject() {
	}

	public KeyObject(byte[] code) {
		this.code = code;
	}

	public void setKeyUsageQualifier(BerOctetString keyUsageQualifier) {
		this.keyUsageQualifier = keyUsageQualifier;
	}

	public BerOctetString getKeyUsageQualifier() {
		return keyUsageQualifier;
	}

	public void setKeyAccess(BerOctetString keyAccess) {
		this.keyAccess = keyAccess;
	}

	public BerOctetString getKeyAccess() {
		return keyAccess;
	}

	public void setKeyIdentifier(BerOctetString keyIdentifier) {
		this.keyIdentifier = keyIdentifier;
	}

	public BerOctetString getKeyIdentifier() {
		return keyIdentifier;
	}

	public void setKeyVersionNumber(BerOctetString keyVersionNumber) {
		this.keyVersionNumber = keyVersionNumber;
	}

	public BerOctetString getKeyVersionNumber() {
		return keyVersionNumber;
	}

	public void setKeyCounterValue(BerOctetString keyCounterValue) {
		this.keyCounterValue = keyCounterValue;
	}

	public BerOctetString getKeyCounterValue() {
		return keyCounterValue;
	}

	public void setKeyCompontents(KeyCompontents keyCompontents) {
		this.keyCompontents = keyCompontents;
	}

	public KeyCompontents getKeyCompontents() {
		return keyCompontents;
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
		codeLength += keyCompontents.encode(reverseOS, true);
		
		if (keyCounterValue != null) {
			codeLength += keyCounterValue.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, PRIMITIVE, 5
			reverseOS.write(0x85);
			codeLength += 1;
		}
		
		codeLength += keyVersionNumber.encode(reverseOS, false);
		// write tag: CONTEXT_CLASS, PRIMITIVE, 3
		reverseOS.write(0x83);
		codeLength += 1;
		
		codeLength += keyIdentifier.encode(reverseOS, false);
		// write tag: CONTEXT_CLASS, PRIMITIVE, 2
		reverseOS.write(0x82);
		codeLength += 1;
		
		if (keyAccess != null) {
			codeLength += keyAccess.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, PRIMITIVE, 22
			reverseOS.write(0x96);
			codeLength += 1;
		}
		
		codeLength += keyUsageQualifier.encode(reverseOS, false);
		// write tag: CONTEXT_CLASS, PRIMITIVE, 21
		reverseOS.write(0x95);
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
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 21)) {
			keyUsageQualifier = new BerOctetString();
			subCodeLength += keyUsageQualifier.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 22)) {
			keyAccess = new BerOctetString();
			subCodeLength += keyAccess.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 2)) {
			keyIdentifier = new BerOctetString();
			subCodeLength += keyIdentifier.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 3)) {
			keyVersionNumber = new BerOctetString();
			subCodeLength += keyVersionNumber.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 5)) {
			keyCounterValue = new BerOctetString();
			subCodeLength += keyCounterValue.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(KeyCompontents.tag)) {
			keyCompontents = new KeyCompontents();
			subCodeLength += keyCompontents.decode(is, false);
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
		if (keyUsageQualifier != null) {
			sb.append("keyUsageQualifier: ").append(keyUsageQualifier);
		}
		else {
			sb.append("keyUsageQualifier: <empty-required-field>");
		}
		
		if (keyAccess != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("keyAccess: ").append(keyAccess);
		}
		
		sb.append(",\n");
		for (int i = 0; i < indentLevel + 1; i++) {
			sb.append("\t");
		}
		if (keyIdentifier != null) {
			sb.append("keyIdentifier: ").append(keyIdentifier);
		}
		else {
			sb.append("keyIdentifier: <empty-required-field>");
		}
		
		sb.append(",\n");
		for (int i = 0; i < indentLevel + 1; i++) {
			sb.append("\t");
		}
		if (keyVersionNumber != null) {
			sb.append("keyVersionNumber: ").append(keyVersionNumber);
		}
		else {
			sb.append("keyVersionNumber: <empty-required-field>");
		}
		
		if (keyCounterValue != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("keyCounterValue: ").append(keyCounterValue);
		}
		
		sb.append(",\n");
		for (int i = 0; i < indentLevel + 1; i++) {
			sb.append("\t");
		}
		if (keyCompontents != null) {
			sb.append("keyCompontents: ");
			keyCompontents.appendAsString(sb, indentLevel + 1);
		}
		else {
			sb.append("keyCompontents: <empty-required-field>");
		}
		
		sb.append("\n");
		for (int i = 0; i < indentLevel; i++) {
			sb.append("\t");
		}
		sb.append("}");
	}

}

