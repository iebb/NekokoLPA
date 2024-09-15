/**
 * This class file was automatically generated by jASN1 v1.11.3 (http://www.beanit.com)
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
import com.beanit.jasn1.ber.*;
import com.beanit.jasn1.ber.types.*;
import com.beanit.jasn1.ber.types.string.*;


public class PEOPTISIM implements BerType, Serializable {

	private static final long serialVersionUID = 1L;

	public static final BerTag tag = new BerTag(BerTag.UNIVERSAL_CLASS, BerTag.CONSTRUCTED, 16);

	public byte[] code = null;
	private PEHeader optisimHeader = null;
	private BerObjectIdentifier templateID = null;
	private File efPcscf = null;
	private File efSms = null;
	private File efSmsp = null;
	private File efSmss = null;
	private File efSmsr = null;
	private File efGbabp = null;
	private File efGbanl = null;
	private File efNafkca = null;
	private File efUicciari = null;
	private File efFrompreferred = null;
	private File efImsconfigdata = null;
	private File efXcapconfigdata = null;
	private File efWebrtcuri = null;
	private File efMudmidconfigdata = null;
	
	public PEOPTISIM() {
	}

	public PEOPTISIM(byte[] code) {
		this.code = code;
	}

	public void setOptisimHeader(PEHeader optisimHeader) {
		this.optisimHeader = optisimHeader;
	}

	public PEHeader getOptisimHeader() {
		return optisimHeader;
	}

	public void setTemplateID(BerObjectIdentifier templateID) {
		this.templateID = templateID;
	}

	public BerObjectIdentifier getTemplateID() {
		return templateID;
	}

	public void setEfPcscf(File efPcscf) {
		this.efPcscf = efPcscf;
	}

	public File getEfPcscf() {
		return efPcscf;
	}

	public void setEfSms(File efSms) {
		this.efSms = efSms;
	}

	public File getEfSms() {
		return efSms;
	}

	public void setEfSmsp(File efSmsp) {
		this.efSmsp = efSmsp;
	}

	public File getEfSmsp() {
		return efSmsp;
	}

	public void setEfSmss(File efSmss) {
		this.efSmss = efSmss;
	}

	public File getEfSmss() {
		return efSmss;
	}

	public void setEfSmsr(File efSmsr) {
		this.efSmsr = efSmsr;
	}

	public File getEfSmsr() {
		return efSmsr;
	}

	public void setEfGbabp(File efGbabp) {
		this.efGbabp = efGbabp;
	}

	public File getEfGbabp() {
		return efGbabp;
	}

	public void setEfGbanl(File efGbanl) {
		this.efGbanl = efGbanl;
	}

	public File getEfGbanl() {
		return efGbanl;
	}

	public void setEfNafkca(File efNafkca) {
		this.efNafkca = efNafkca;
	}

	public File getEfNafkca() {
		return efNafkca;
	}

	public void setEfUicciari(File efUicciari) {
		this.efUicciari = efUicciari;
	}

	public File getEfUicciari() {
		return efUicciari;
	}

	public void setEfFrompreferred(File efFrompreferred) {
		this.efFrompreferred = efFrompreferred;
	}

	public File getEfFrompreferred() {
		return efFrompreferred;
	}

	public void setEfImsconfigdata(File efImsconfigdata) {
		this.efImsconfigdata = efImsconfigdata;
	}

	public File getEfImsconfigdata() {
		return efImsconfigdata;
	}

	public void setEfXcapconfigdata(File efXcapconfigdata) {
		this.efXcapconfigdata = efXcapconfigdata;
	}

	public File getEfXcapconfigdata() {
		return efXcapconfigdata;
	}

	public void setEfWebrtcuri(File efWebrtcuri) {
		this.efWebrtcuri = efWebrtcuri;
	}

	public File getEfWebrtcuri() {
		return efWebrtcuri;
	}

	public void setEfMudmidconfigdata(File efMudmidconfigdata) {
		this.efMudmidconfigdata = efMudmidconfigdata;
	}

	public File getEfMudmidconfigdata() {
		return efMudmidconfigdata;
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
		if (efMudmidconfigdata != null) {
			codeLength += efMudmidconfigdata.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 15
			reverseOS.write(0xAF);
			codeLength += 1;
		}
		
		if (efWebrtcuri != null) {
			codeLength += efWebrtcuri.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 14
			reverseOS.write(0xAE);
			codeLength += 1;
		}
		
		if (efXcapconfigdata != null) {
			codeLength += efXcapconfigdata.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 13
			reverseOS.write(0xAD);
			codeLength += 1;
		}
		
		if (efImsconfigdata != null) {
			codeLength += efImsconfigdata.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 12
			reverseOS.write(0xAC);
			codeLength += 1;
		}
		
		if (efFrompreferred != null) {
			codeLength += efFrompreferred.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 11
			reverseOS.write(0xAB);
			codeLength += 1;
		}
		
		if (efUicciari != null) {
			codeLength += efUicciari.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 10
			reverseOS.write(0xAA);
			codeLength += 1;
		}
		
		if (efNafkca != null) {
			codeLength += efNafkca.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 9
			reverseOS.write(0xA9);
			codeLength += 1;
		}
		
		if (efGbanl != null) {
			codeLength += efGbanl.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 8
			reverseOS.write(0xA8);
			codeLength += 1;
		}
		
		if (efGbabp != null) {
			codeLength += efGbabp.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 7
			reverseOS.write(0xA7);
			codeLength += 1;
		}
		
		if (efSmsr != null) {
			codeLength += efSmsr.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 6
			reverseOS.write(0xA6);
			codeLength += 1;
		}
		
		if (efSmss != null) {
			codeLength += efSmss.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 5
			reverseOS.write(0xA5);
			codeLength += 1;
		}
		
		if (efSmsp != null) {
			codeLength += efSmsp.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 4
			reverseOS.write(0xA4);
			codeLength += 1;
		}
		
		if (efSms != null) {
			codeLength += efSms.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 3
			reverseOS.write(0xA3);
			codeLength += 1;
		}
		
		if (efPcscf != null) {
			codeLength += efPcscf.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 2
			reverseOS.write(0xA2);
			codeLength += 1;
		}
		
		codeLength += templateID.encode(reverseOS, false);
		// write tag: CONTEXT_CLASS, PRIMITIVE, 1
		reverseOS.write(0x81);
		codeLength += 1;
		
		codeLength += optisimHeader.encode(reverseOS, false);
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
			optisimHeader = new PEHeader();
			subCodeLength += optisimHeader.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 1)) {
			templateID = new BerObjectIdentifier();
			subCodeLength += templateID.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 2)) {
			efPcscf = new File();
			subCodeLength += efPcscf.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 3)) {
			efSms = new File();
			subCodeLength += efSms.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 4)) {
			efSmsp = new File();
			subCodeLength += efSmsp.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 5)) {
			efSmss = new File();
			subCodeLength += efSmss.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 6)) {
			efSmsr = new File();
			subCodeLength += efSmsr.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 7)) {
			efGbabp = new File();
			subCodeLength += efGbabp.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 8)) {
			efGbanl = new File();
			subCodeLength += efGbanl.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 9)) {
			efNafkca = new File();
			subCodeLength += efNafkca.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 10)) {
			efUicciari = new File();
			subCodeLength += efUicciari.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 11)) {
			efFrompreferred = new File();
			subCodeLength += efFrompreferred.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 12)) {
			efImsconfigdata = new File();
			subCodeLength += efImsconfigdata.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 13)) {
			efXcapconfigdata = new File();
			subCodeLength += efXcapconfigdata.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 14)) {
			efWebrtcuri = new File();
			subCodeLength += efWebrtcuri.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 15)) {
			efMudmidconfigdata = new File();
			subCodeLength += efMudmidconfigdata.decode(is, false);
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
		if (optisimHeader != null) {
			sb.append("optisimHeader: ");
			optisimHeader.appendAsString(sb, indentLevel + 1);
		}
		else {
			sb.append("optisimHeader: <empty-required-field>");
		}
		
		sb.append(",\n");
		for (int i = 0; i < indentLevel + 1; i++) {
			sb.append("\t");
		}
		if (templateID != null) {
			sb.append("templateID: ").append(templateID);
		}
		else {
			sb.append("templateID: <empty-required-field>");
		}
		
		if (efPcscf != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("efPcscf: ");
			efPcscf.appendAsString(sb, indentLevel + 1);
		}
		
		if (efSms != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("efSms: ");
			efSms.appendAsString(sb, indentLevel + 1);
		}
		
		if (efSmsp != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("efSmsp: ");
			efSmsp.appendAsString(sb, indentLevel + 1);
		}
		
		if (efSmss != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("efSmss: ");
			efSmss.appendAsString(sb, indentLevel + 1);
		}
		
		if (efSmsr != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("efSmsr: ");
			efSmsr.appendAsString(sb, indentLevel + 1);
		}
		
		if (efGbabp != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("efGbabp: ");
			efGbabp.appendAsString(sb, indentLevel + 1);
		}
		
		if (efGbanl != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("efGbanl: ");
			efGbanl.appendAsString(sb, indentLevel + 1);
		}
		
		if (efNafkca != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("efNafkca: ");
			efNafkca.appendAsString(sb, indentLevel + 1);
		}
		
		if (efUicciari != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("efUicciari: ");
			efUicciari.appendAsString(sb, indentLevel + 1);
		}
		
		if (efFrompreferred != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("efFrompreferred: ");
			efFrompreferred.appendAsString(sb, indentLevel + 1);
		}
		
		if (efImsconfigdata != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("efImsconfigdata: ");
			efImsconfigdata.appendAsString(sb, indentLevel + 1);
		}
		
		if (efXcapconfigdata != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("efXcapconfigdata: ");
			efXcapconfigdata.appendAsString(sb, indentLevel + 1);
		}
		
		if (efWebrtcuri != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("efWebrtcuri: ");
			efWebrtcuri.appendAsString(sb, indentLevel + 1);
		}
		
		if (efMudmidconfigdata != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("efMudmidconfigdata: ");
			efMudmidconfigdata.appendAsString(sb, indentLevel + 1);
		}
		
		sb.append("\n");
		for (int i = 0; i < indentLevel; i++) {
			sb.append("\t");
		}
		sb.append("}");
	}

}

