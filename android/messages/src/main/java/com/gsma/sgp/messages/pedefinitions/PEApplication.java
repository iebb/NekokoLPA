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


public class PEApplication implements BerType, Serializable {

	private static final long serialVersionUID = 1L;

	public static class InstanceList implements BerType, Serializable {

		private static final long serialVersionUID = 1L;

		public static final BerTag tag = new BerTag(BerTag.UNIVERSAL_CLASS, BerTag.CONSTRUCTED, 16);
		public byte[] code = null;
		private List<ApplicationInstance> seqOf = null;

		public InstanceList() {
			seqOf = new ArrayList<ApplicationInstance>();
		}

		public InstanceList(byte[] code) {
			this.code = code;
		}

		public List<ApplicationInstance> getApplicationInstance() {
			if (seqOf == null) {
				seqOf = new ArrayList<ApplicationInstance>();
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
				ApplicationInstance element = new ApplicationInstance();
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
				Iterator<ApplicationInstance> it = seqOf.iterator();
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
	private PEHeader appHeader = null;
	private ApplicationLoadPackage loadBlock = null;
	private InstanceList instanceList = null;
	
	public PEApplication() {
	}

	public PEApplication(byte[] code) {
		this.code = code;
	}

	public void setAppHeader(PEHeader appHeader) {
		this.appHeader = appHeader;
	}

	public PEHeader getAppHeader() {
		return appHeader;
	}

	public void setLoadBlock(ApplicationLoadPackage loadBlock) {
		this.loadBlock = loadBlock;
	}

	public ApplicationLoadPackage getLoadBlock() {
		return loadBlock;
	}

	public void setInstanceList(InstanceList instanceList) {
		this.instanceList = instanceList;
	}

	public InstanceList getInstanceList() {
		return instanceList;
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
		if (instanceList != null) {
			codeLength += instanceList.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 2
			reverseOS.write(0xA2);
			codeLength += 1;
		}
		
		if (loadBlock != null) {
			codeLength += loadBlock.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 1
			reverseOS.write(0xA1);
			codeLength += 1;
		}
		
		codeLength += appHeader.encode(reverseOS, false);
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
			appHeader = new PEHeader();
			subCodeLength += appHeader.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 1)) {
			loadBlock = new ApplicationLoadPackage();
			subCodeLength += loadBlock.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 2)) {
			instanceList = new InstanceList();
			subCodeLength += instanceList.decode(is, false);
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
		if (appHeader != null) {
			sb.append("appHeader: ");
			appHeader.appendAsString(sb, indentLevel + 1);
		}
		else {
			sb.append("appHeader: <empty-required-field>");
		}
		
		if (loadBlock != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("loadBlock: ");
			loadBlock.appendAsString(sb, indentLevel + 1);
		}
		
		if (instanceList != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("instanceList: ");
			instanceList.appendAsString(sb, indentLevel + 1);
		}
		
		sb.append("\n");
		for (int i = 0; i < indentLevel; i++) {
			sb.append("\t");
		}
		sb.append("}");
	}

}

