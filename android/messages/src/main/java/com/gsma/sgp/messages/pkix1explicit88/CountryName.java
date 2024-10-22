/**
 * This class file was automatically generated by asn1bean v1.11.3 (http://www.beanit.com)
 */

package com.gsma.sgp.messages.pkix1explicit88;

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


public class CountryName implements BerType, Serializable {

	private static final long serialVersionUID = 1L;

	public byte[] code = null;
	public static final BerTag tag = new BerTag(BerTag.APPLICATION_CLASS, BerTag.CONSTRUCTED, 1);

	private BerNumericString x121DccCode = null;
	private BerPrintableString iso3166Alpha2Code = null;
	
	public CountryName() {
	}

	public CountryName(byte[] code) {
		this.code = code;
	}

	public void setX121DccCode(BerNumericString x121DccCode) {
		this.x121DccCode = x121DccCode;
	}

	public BerNumericString getX121DccCode() {
		return x121DccCode;
	}

	public void setIso3166Alpha2Code(BerPrintableString iso3166Alpha2Code) {
		this.iso3166Alpha2Code = iso3166Alpha2Code;
	}

	public BerPrintableString getIso3166Alpha2Code() {
		return iso3166Alpha2Code;
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
		if (iso3166Alpha2Code != null) {
			codeLength += iso3166Alpha2Code.encode(reverseOS, true);
			codeLength += BerLength.encodeLength(reverseOS, codeLength);
			if (withTag) {
				codeLength += tag.encode(reverseOS);
			}
			return codeLength;
		}
		
		if (x121DccCode != null) {
			codeLength += x121DccCode.encode(reverseOS, true);
			codeLength += BerLength.encodeLength(reverseOS, codeLength);
			if (withTag) {
				codeLength += tag.encode(reverseOS);
			}
			return codeLength;
		}
		
		throw new IOException("Error encoding CHOICE: No element of CHOICE was selected.");
	}

	public int decode(InputStream is) throws IOException {
		return decode(is, true);
	}

	public int decode(InputStream is, boolean withTag) throws IOException {
		int codeLength = 0;
		BerLength length = new BerLength();
		BerTag berTag = new BerTag();

		if (withTag) {
			codeLength += tag.decodeAndCheck(is);
		}

		codeLength += length.decode(is);
		codeLength += berTag.decode(is);

		if (berTag.equals(BerNumericString.tag)) {
			x121DccCode = new BerNumericString();
			codeLength += x121DccCode.decode(is, false);
			return codeLength;
		}

		if (berTag.equals(BerPrintableString.tag)) {
			iso3166Alpha2Code = new BerPrintableString();
			codeLength += iso3166Alpha2Code.decode(is, false);
			return codeLength;
		}

		throw new IOException("Error decoding CHOICE: Tag " + berTag + " matched to no item.");
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

		if (x121DccCode != null) {
			sb.append("x121DccCode: ").append(x121DccCode);
			return;
		}

		if (iso3166Alpha2Code != null) {
			sb.append("iso3166Alpha2Code: ").append(iso3166Alpha2Code);
			return;
		}

		sb.append("<none>");
	}

}

