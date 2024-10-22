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


public class ProprietaryInfo implements BerType, Serializable {

	private static final long serialVersionUID = 1L;

	public static final BerTag tag = new BerTag(BerTag.UNIVERSAL_CLASS, BerTag.CONSTRUCTED, 16);

	public byte[] code = null;
	private BerOctetString specialFileInformation = null;
	private BerOctetString fillPattern = null;
	private BerOctetString repeatPattern = null;
	private BerOctetString maximumFileSize = null;
	private BerOctetString fileDetails = null;
	
	public ProprietaryInfo() {
	}

	public ProprietaryInfo(byte[] code) {
		this.code = code;
	}

	public void setSpecialFileInformation(BerOctetString specialFileInformation) {
		this.specialFileInformation = specialFileInformation;
	}

	public BerOctetString getSpecialFileInformation() {
		return specialFileInformation;
	}

	public void setFillPattern(BerOctetString fillPattern) {
		this.fillPattern = fillPattern;
	}

	public BerOctetString getFillPattern() {
		return fillPattern;
	}

	public void setRepeatPattern(BerOctetString repeatPattern) {
		this.repeatPattern = repeatPattern;
	}

	public BerOctetString getRepeatPattern() {
		return repeatPattern;
	}

	public void setMaximumFileSize(BerOctetString maximumFileSize) {
		this.maximumFileSize = maximumFileSize;
	}

	public BerOctetString getMaximumFileSize() {
		return maximumFileSize;
	}

	public void setFileDetails(BerOctetString fileDetails) {
		this.fileDetails = fileDetails;
	}

	public BerOctetString getFileDetails() {
		return fileDetails;
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
		if (fileDetails != null) {
			codeLength += fileDetails.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, PRIMITIVE, 4
			reverseOS.write(0x84);
			codeLength += 1;
		}
		
		if (maximumFileSize != null) {
			codeLength += maximumFileSize.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, PRIMITIVE, 6
			reverseOS.write(0x86);
			codeLength += 1;
		}
		
		if (repeatPattern != null) {
			codeLength += repeatPattern.encode(reverseOS, false);
			// write tag: PRIVATE_CLASS, PRIMITIVE, 2
			reverseOS.write(0xC2);
			codeLength += 1;
		}
		
		if (fillPattern != null) {
			codeLength += fillPattern.encode(reverseOS, false);
			// write tag: PRIVATE_CLASS, PRIMITIVE, 1
			reverseOS.write(0xC1);
			codeLength += 1;
		}
		
		if (specialFileInformation != null) {
			codeLength += specialFileInformation.encode(reverseOS, false);
			// write tag: PRIVATE_CLASS, PRIMITIVE, 0
			reverseOS.write(0xC0);
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
		if (berTag.equals(BerTag.PRIVATE_CLASS, BerTag.PRIMITIVE, 0)) {
			specialFileInformation = new BerOctetString();
			subCodeLength += specialFileInformation.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.PRIVATE_CLASS, BerTag.PRIMITIVE, 1)) {
			fillPattern = new BerOctetString();
			subCodeLength += fillPattern.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.PRIVATE_CLASS, BerTag.PRIMITIVE, 2)) {
			repeatPattern = new BerOctetString();
			subCodeLength += repeatPattern.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 6)) {
			maximumFileSize = new BerOctetString();
			subCodeLength += maximumFileSize.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 4)) {
			fileDetails = new BerOctetString();
			subCodeLength += fileDetails.decode(is, false);
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
		if (specialFileInformation != null) {
			sb.append("\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("specialFileInformation: ").append(specialFileInformation);
			firstSelectedElement = false;
		}
		
		if (fillPattern != null) {
			if (!firstSelectedElement) {
				sb.append(",\n");
			}
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("fillPattern: ").append(fillPattern);
			firstSelectedElement = false;
		}
		
		if (repeatPattern != null) {
			if (!firstSelectedElement) {
				sb.append(",\n");
			}
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("repeatPattern: ").append(repeatPattern);
			firstSelectedElement = false;
		}
		
		if (maximumFileSize != null) {
			if (!firstSelectedElement) {
				sb.append(",\n");
			}
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("maximumFileSize: ").append(maximumFileSize);
			firstSelectedElement = false;
		}
		
		if (fileDetails != null) {
			if (!firstSelectedElement) {
				sb.append(",\n");
			}
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("fileDetails: ").append(fileDetails);
			firstSelectedElement = false;
		}
		
		sb.append("\n");
		for (int i = 0; i < indentLevel; i++) {
			sb.append("\t");
		}
		sb.append("}");
	}

}

