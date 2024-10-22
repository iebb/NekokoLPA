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


public class PEUSIM implements BerType, Serializable {

	private static final long serialVersionUID = 1L;

	public static final BerTag tag = new BerTag(BerTag.UNIVERSAL_CLASS, BerTag.CONSTRUCTED, 16);

	public byte[] code = null;
	private PEHeader usimHeader = null;
	private BerObjectIdentifier templateID = null;
	private File adfUsim = null;
	private File efImsi = null;
	private File efArr = null;
	private File efKeys = null;
	private File efKeysPS = null;
	private File efHpplmn = null;
	private File efUst = null;
	private File efFdn = null;
	private File efSms = null;
	private File efSmsp = null;
	private File efSmss = null;
	private File efSpn = null;
	private File efEst = null;
	private File efStartHfn = null;
	private File efThreshold = null;
	private File efPsloci = null;
	private File efAcc = null;
	private File efFplmn = null;
	private File efLoci = null;
	private File efAd = null;
	private File efEcc = null;
	private File efNetpar = null;
	private File efEpsloci = null;
	private File efEpsnsc = null;
	
	public PEUSIM() {
	}

	public PEUSIM(byte[] code) {
		this.code = code;
	}

	public void setUsimHeader(PEHeader usimHeader) {
		this.usimHeader = usimHeader;
	}

	public PEHeader getUsimHeader() {
		return usimHeader;
	}

	public void setTemplateID(BerObjectIdentifier templateID) {
		this.templateID = templateID;
	}

	public BerObjectIdentifier getTemplateID() {
		return templateID;
	}

	public void setAdfUsim(File adfUsim) {
		this.adfUsim = adfUsim;
	}

	public File getAdfUsim() {
		return adfUsim;
	}

	public void setEfImsi(File efImsi) {
		this.efImsi = efImsi;
	}

	public File getEfImsi() {
		return efImsi;
	}

	public void setEfArr(File efArr) {
		this.efArr = efArr;
	}

	public File getEfArr() {
		return efArr;
	}

	public void setEfKeys(File efKeys) {
		this.efKeys = efKeys;
	}

	public File getEfKeys() {
		return efKeys;
	}

	public void setEfKeysPS(File efKeysPS) {
		this.efKeysPS = efKeysPS;
	}

	public File getEfKeysPS() {
		return efKeysPS;
	}

	public void setEfHpplmn(File efHpplmn) {
		this.efHpplmn = efHpplmn;
	}

	public File getEfHpplmn() {
		return efHpplmn;
	}

	public void setEfUst(File efUst) {
		this.efUst = efUst;
	}

	public File getEfUst() {
		return efUst;
	}

	public void setEfFdn(File efFdn) {
		this.efFdn = efFdn;
	}

	public File getEfFdn() {
		return efFdn;
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

	public void setEfSpn(File efSpn) {
		this.efSpn = efSpn;
	}

	public File getEfSpn() {
		return efSpn;
	}

	public void setEfEst(File efEst) {
		this.efEst = efEst;
	}

	public File getEfEst() {
		return efEst;
	}

	public void setEfStartHfn(File efStartHfn) {
		this.efStartHfn = efStartHfn;
	}

	public File getEfStartHfn() {
		return efStartHfn;
	}

	public void setEfThreshold(File efThreshold) {
		this.efThreshold = efThreshold;
	}

	public File getEfThreshold() {
		return efThreshold;
	}

	public void setEfPsloci(File efPsloci) {
		this.efPsloci = efPsloci;
	}

	public File getEfPsloci() {
		return efPsloci;
	}

	public void setEfAcc(File efAcc) {
		this.efAcc = efAcc;
	}

	public File getEfAcc() {
		return efAcc;
	}

	public void setEfFplmn(File efFplmn) {
		this.efFplmn = efFplmn;
	}

	public File getEfFplmn() {
		return efFplmn;
	}

	public void setEfLoci(File efLoci) {
		this.efLoci = efLoci;
	}

	public File getEfLoci() {
		return efLoci;
	}

	public void setEfAd(File efAd) {
		this.efAd = efAd;
	}

	public File getEfAd() {
		return efAd;
	}

	public void setEfEcc(File efEcc) {
		this.efEcc = efEcc;
	}

	public File getEfEcc() {
		return efEcc;
	}

	public void setEfNetpar(File efNetpar) {
		this.efNetpar = efNetpar;
	}

	public File getEfNetpar() {
		return efNetpar;
	}

	public void setEfEpsloci(File efEpsloci) {
		this.efEpsloci = efEpsloci;
	}

	public File getEfEpsloci() {
		return efEpsloci;
	}

	public void setEfEpsnsc(File efEpsnsc) {
		this.efEpsnsc = efEpsnsc;
	}

	public File getEfEpsnsc() {
		return efEpsnsc;
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
		if (efEpsnsc != null) {
			codeLength += efEpsnsc.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 25
			reverseOS.write(0xB9);
			codeLength += 1;
		}
		
		if (efEpsloci != null) {
			codeLength += efEpsloci.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 24
			reverseOS.write(0xB8);
			codeLength += 1;
		}
		
		if (efNetpar != null) {
			codeLength += efNetpar.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 23
			reverseOS.write(0xB7);
			codeLength += 1;
		}
		
		codeLength += efEcc.encode(reverseOS, false);
		// write tag: CONTEXT_CLASS, CONSTRUCTED, 22
		reverseOS.write(0xB6);
		codeLength += 1;
		
		if (efAd != null) {
			codeLength += efAd.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 21
			reverseOS.write(0xB5);
			codeLength += 1;
		}
		
		if (efLoci != null) {
			codeLength += efLoci.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 20
			reverseOS.write(0xB4);
			codeLength += 1;
		}
		
		if (efFplmn != null) {
			codeLength += efFplmn.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 19
			reverseOS.write(0xB3);
			codeLength += 1;
		}
		
		codeLength += efAcc.encode(reverseOS, false);
		// write tag: CONTEXT_CLASS, CONSTRUCTED, 18
		reverseOS.write(0xB2);
		codeLength += 1;
		
		if (efPsloci != null) {
			codeLength += efPsloci.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 17
			reverseOS.write(0xB1);
			codeLength += 1;
		}
		
		if (efThreshold != null) {
			codeLength += efThreshold.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 16
			reverseOS.write(0xB0);
			codeLength += 1;
		}
		
		if (efStartHfn != null) {
			codeLength += efStartHfn.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 15
			reverseOS.write(0xAF);
			codeLength += 1;
		}
		
		codeLength += efEst.encode(reverseOS, false);
		// write tag: CONTEXT_CLASS, CONSTRUCTED, 14
		reverseOS.write(0xAE);
		codeLength += 1;
		
		codeLength += efSpn.encode(reverseOS, false);
		// write tag: CONTEXT_CLASS, CONSTRUCTED, 13
		reverseOS.write(0xAD);
		codeLength += 1;
		
		if (efSmss != null) {
			codeLength += efSmss.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 12
			reverseOS.write(0xAC);
			codeLength += 1;
		}
		
		if (efSmsp != null) {
			codeLength += efSmsp.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 11
			reverseOS.write(0xAB);
			codeLength += 1;
		}
		
		if (efSms != null) {
			codeLength += efSms.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 10
			reverseOS.write(0xAA);
			codeLength += 1;
		}
		
		if (efFdn != null) {
			codeLength += efFdn.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 9
			reverseOS.write(0xA9);
			codeLength += 1;
		}
		
		codeLength += efUst.encode(reverseOS, false);
		// write tag: CONTEXT_CLASS, CONSTRUCTED, 8
		reverseOS.write(0xA8);
		codeLength += 1;
		
		if (efHpplmn != null) {
			codeLength += efHpplmn.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 7
			reverseOS.write(0xA7);
			codeLength += 1;
		}
		
		if (efKeysPS != null) {
			codeLength += efKeysPS.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 6
			reverseOS.write(0xA6);
			codeLength += 1;
		}
		
		if (efKeys != null) {
			codeLength += efKeys.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 5
			reverseOS.write(0xA5);
			codeLength += 1;
		}
		
		codeLength += efArr.encode(reverseOS, false);
		// write tag: CONTEXT_CLASS, CONSTRUCTED, 4
		reverseOS.write(0xA4);
		codeLength += 1;
		
		codeLength += efImsi.encode(reverseOS, false);
		// write tag: CONTEXT_CLASS, CONSTRUCTED, 3
		reverseOS.write(0xA3);
		codeLength += 1;
		
		codeLength += adfUsim.encode(reverseOS, false);
		// write tag: CONTEXT_CLASS, CONSTRUCTED, 2
		reverseOS.write(0xA2);
		codeLength += 1;
		
		codeLength += templateID.encode(reverseOS, false);
		// write tag: CONTEXT_CLASS, PRIMITIVE, 1
		reverseOS.write(0x81);
		codeLength += 1;
		
		codeLength += usimHeader.encode(reverseOS, false);
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
			usimHeader = new PEHeader();
			subCodeLength += usimHeader.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 1)) {
			templateID = new BerObjectIdentifier();
			subCodeLength += templateID.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 2)) {
			adfUsim = new File();
			subCodeLength += adfUsim.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 3)) {
			efImsi = new File();
			subCodeLength += efImsi.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 4)) {
			efArr = new File();
			subCodeLength += efArr.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 5)) {
			efKeys = new File();
			subCodeLength += efKeys.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 6)) {
			efKeysPS = new File();
			subCodeLength += efKeysPS.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 7)) {
			efHpplmn = new File();
			subCodeLength += efHpplmn.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 8)) {
			efUst = new File();
			subCodeLength += efUst.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 9)) {
			efFdn = new File();
			subCodeLength += efFdn.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 10)) {
			efSms = new File();
			subCodeLength += efSms.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 11)) {
			efSmsp = new File();
			subCodeLength += efSmsp.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 12)) {
			efSmss = new File();
			subCodeLength += efSmss.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 13)) {
			efSpn = new File();
			subCodeLength += efSpn.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 14)) {
			efEst = new File();
			subCodeLength += efEst.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 15)) {
			efStartHfn = new File();
			subCodeLength += efStartHfn.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 16)) {
			efThreshold = new File();
			subCodeLength += efThreshold.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 17)) {
			efPsloci = new File();
			subCodeLength += efPsloci.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 18)) {
			efAcc = new File();
			subCodeLength += efAcc.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 19)) {
			efFplmn = new File();
			subCodeLength += efFplmn.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 20)) {
			efLoci = new File();
			subCodeLength += efLoci.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 21)) {
			efAd = new File();
			subCodeLength += efAd.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 22)) {
			efEcc = new File();
			subCodeLength += efEcc.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 23)) {
			efNetpar = new File();
			subCodeLength += efNetpar.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 24)) {
			efEpsloci = new File();
			subCodeLength += efEpsloci.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 25)) {
			efEpsnsc = new File();
			subCodeLength += efEpsnsc.decode(is, false);
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
		if (usimHeader != null) {
			sb.append("usimHeader: ");
			usimHeader.appendAsString(sb, indentLevel + 1);
		}
		else {
			sb.append("usimHeader: <empty-required-field>");
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
		
		sb.append(",\n");
		for (int i = 0; i < indentLevel + 1; i++) {
			sb.append("\t");
		}
		if (adfUsim != null) {
			sb.append("adfUsim: ");
			adfUsim.appendAsString(sb, indentLevel + 1);
		}
		else {
			sb.append("adfUsim: <empty-required-field>");
		}
		
		sb.append(",\n");
		for (int i = 0; i < indentLevel + 1; i++) {
			sb.append("\t");
		}
		if (efImsi != null) {
			sb.append("efImsi: ");
			efImsi.appendAsString(sb, indentLevel + 1);
		}
		else {
			sb.append("efImsi: <empty-required-field>");
		}
		
		sb.append(",\n");
		for (int i = 0; i < indentLevel + 1; i++) {
			sb.append("\t");
		}
		if (efArr != null) {
			sb.append("efArr: ");
			efArr.appendAsString(sb, indentLevel + 1);
		}
		else {
			sb.append("efArr: <empty-required-field>");
		}
		
		if (efKeys != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("efKeys: ");
			efKeys.appendAsString(sb, indentLevel + 1);
		}
		
		if (efKeysPS != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("efKeysPS: ");
			efKeysPS.appendAsString(sb, indentLevel + 1);
		}
		
		if (efHpplmn != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("efHpplmn: ");
			efHpplmn.appendAsString(sb, indentLevel + 1);
		}
		
		sb.append(",\n");
		for (int i = 0; i < indentLevel + 1; i++) {
			sb.append("\t");
		}
		if (efUst != null) {
			sb.append("efUst: ");
			efUst.appendAsString(sb, indentLevel + 1);
		}
		else {
			sb.append("efUst: <empty-required-field>");
		}
		
		if (efFdn != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("efFdn: ");
			efFdn.appendAsString(sb, indentLevel + 1);
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
		
		sb.append(",\n");
		for (int i = 0; i < indentLevel + 1; i++) {
			sb.append("\t");
		}
		if (efSpn != null) {
			sb.append("efSpn: ");
			efSpn.appendAsString(sb, indentLevel + 1);
		}
		else {
			sb.append("efSpn: <empty-required-field>");
		}
		
		sb.append(",\n");
		for (int i = 0; i < indentLevel + 1; i++) {
			sb.append("\t");
		}
		if (efEst != null) {
			sb.append("efEst: ");
			efEst.appendAsString(sb, indentLevel + 1);
		}
		else {
			sb.append("efEst: <empty-required-field>");
		}
		
		if (efStartHfn != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("efStartHfn: ");
			efStartHfn.appendAsString(sb, indentLevel + 1);
		}
		
		if (efThreshold != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("efThreshold: ");
			efThreshold.appendAsString(sb, indentLevel + 1);
		}
		
		if (efPsloci != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("efPsloci: ");
			efPsloci.appendAsString(sb, indentLevel + 1);
		}
		
		sb.append(",\n");
		for (int i = 0; i < indentLevel + 1; i++) {
			sb.append("\t");
		}
		if (efAcc != null) {
			sb.append("efAcc: ");
			efAcc.appendAsString(sb, indentLevel + 1);
		}
		else {
			sb.append("efAcc: <empty-required-field>");
		}
		
		if (efFplmn != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("efFplmn: ");
			efFplmn.appendAsString(sb, indentLevel + 1);
		}
		
		if (efLoci != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("efLoci: ");
			efLoci.appendAsString(sb, indentLevel + 1);
		}
		
		if (efAd != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("efAd: ");
			efAd.appendAsString(sb, indentLevel + 1);
		}
		
		sb.append(",\n");
		for (int i = 0; i < indentLevel + 1; i++) {
			sb.append("\t");
		}
		if (efEcc != null) {
			sb.append("efEcc: ");
			efEcc.appendAsString(sb, indentLevel + 1);
		}
		else {
			sb.append("efEcc: <empty-required-field>");
		}
		
		if (efNetpar != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("efNetpar: ");
			efNetpar.appendAsString(sb, indentLevel + 1);
		}
		
		if (efEpsloci != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("efEpsloci: ");
			efEpsloci.appendAsString(sb, indentLevel + 1);
		}
		
		if (efEpsnsc != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("efEpsnsc: ");
			efEpsnsc.appendAsString(sb, indentLevel + 1);
		}
		
		sb.append("\n");
		for (int i = 0; i < indentLevel; i++) {
			sb.append("\t");
		}
		sb.append("}");
	}

}

