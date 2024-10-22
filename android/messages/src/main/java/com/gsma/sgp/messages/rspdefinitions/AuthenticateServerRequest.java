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

public class AuthenticateServerRequest implements BerType, Serializable {

	private static final long serialVersionUID = 1L;

	public static class CrlList implements BerType, Serializable {

		private static final long serialVersionUID = 1L;

		public static final BerTag tag = new BerTag(BerTag.UNIVERSAL_CLASS, BerTag.CONSTRUCTED, 16);
		public byte[] code = null;
		private List<CertificateList> seqOf = null;

		public CrlList() {
			seqOf = new ArrayList<CertificateList>();
		}

		public CrlList(byte[] code) {
			this.code = code;
		}

		public List<CertificateList> getCertificateList() {
			if (seqOf == null) {
				seqOf = new ArrayList<CertificateList>();
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
				CertificateList element = new CertificateList();
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
				Iterator<CertificateList> it = seqOf.iterator();
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

	public static final BerTag tag = new BerTag(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 56);

	public byte[] code = null;
	private ServerSigned1 serverSigned1 = null;
	private BerOctetString serverSignature1 = null;
	private SubjectKeyIdentifier euiccCiPKIdToBeUsed = null;
	private Certificate serverCertificate = null;
	private CtxParams1 ctxParams1 = null;
	private CertificateChain otherCertsInChain = null;
	private CrlList crlList = null;
	
	public AuthenticateServerRequest() {
	}

	public AuthenticateServerRequest(byte[] code) {
		this.code = code;
	}

	public void setServerSigned1(ServerSigned1 serverSigned1) {
		this.serverSigned1 = serverSigned1;
	}

	public ServerSigned1 getServerSigned1() {
		return serverSigned1;
	}

	public void setServerSignature1(BerOctetString serverSignature1) {
		this.serverSignature1 = serverSignature1;
	}

	public BerOctetString getServerSignature1() {
		return serverSignature1;
	}

	public void setEuiccCiPKIdToBeUsed(SubjectKeyIdentifier euiccCiPKIdToBeUsed) {
		this.euiccCiPKIdToBeUsed = euiccCiPKIdToBeUsed;
	}

	public SubjectKeyIdentifier getEuiccCiPKIdToBeUsed() {
		return euiccCiPKIdToBeUsed;
	}

	public void setServerCertificate(Certificate serverCertificate) {
		this.serverCertificate = serverCertificate;
	}

	public Certificate getServerCertificate() {
		return serverCertificate;
	}

	public void setCtxParams1(CtxParams1 ctxParams1) {
		this.ctxParams1 = ctxParams1;
	}

	public CtxParams1 getCtxParams1() {
		return ctxParams1;
	}

	public void setOtherCertsInChain(CertificateChain otherCertsInChain) {
		this.otherCertsInChain = otherCertsInChain;
	}

	public CertificateChain getOtherCertsInChain() {
		return otherCertsInChain;
	}

	public void setCrlList(CrlList crlList) {
		this.crlList = crlList;
	}

	public CrlList getCrlList() {
		return crlList;
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
		if (crlList != null) {
			codeLength += crlList.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 2
			reverseOS.write(0xA2);
			codeLength += 1;
		}
		
		if (otherCertsInChain != null) {
			codeLength += otherCertsInChain.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 1
			reverseOS.write(0xA1);
			codeLength += 1;
		}
		
		codeLength += ctxParams1.encode(reverseOS);
		
		codeLength += serverCertificate.encode(reverseOS, true);
		
		if (euiccCiPKIdToBeUsed != null) {
			codeLength += euiccCiPKIdToBeUsed.encode(reverseOS, true);
		}
		
		codeLength += serverSignature1.encode(reverseOS, false);
		// write tag: APPLICATION_CLASS, PRIMITIVE, 55
		reverseOS.write(0x37);
		reverseOS.write(0x5F);
		codeLength += 2;
		
		codeLength += serverSigned1.encode(reverseOS, true);
		
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
		if (berTag.equals(ServerSigned1.tag)) {
			serverSigned1 = new ServerSigned1();
			subCodeLength += serverSigned1.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(BerTag.APPLICATION_CLASS, BerTag.PRIMITIVE, 55)) {
			serverSignature1 = new BerOctetString();
			subCodeLength += serverSignature1.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(SubjectKeyIdentifier.tag)) {
			euiccCiPKIdToBeUsed = new SubjectKeyIdentifier();
			subCodeLength += euiccCiPKIdToBeUsed.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(Certificate.tag)) {
			serverCertificate = new Certificate();
			subCodeLength += serverCertificate.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		ctxParams1 = new CtxParams1();
		subCodeLength += ctxParams1.decode(is, berTag);
		if (subCodeLength == totalLength) {
			return codeLength;
		}
		subCodeLength += berTag.decode(is);
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 1)) {
			otherCertsInChain = new CertificateChain();
			subCodeLength += otherCertsInChain.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 2)) {
			crlList = new CrlList();
			subCodeLength += crlList.decode(is, false);
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
		if (serverSigned1 != null) {
			sb.append("serverSigned1: ");
			serverSigned1.appendAsString(sb, indentLevel + 1);
		}
		else {
			sb.append("serverSigned1: <empty-required-field>");
		}
		
		sb.append(",\n");
		for (int i = 0; i < indentLevel + 1; i++) {
			sb.append("\t");
		}
		if (serverSignature1 != null) {
			sb.append("serverSignature1: ").append(serverSignature1);
		}
		else {
			sb.append("serverSignature1: <empty-required-field>");
		}
		
		if (euiccCiPKIdToBeUsed != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("euiccCiPKIdToBeUsed: ").append(euiccCiPKIdToBeUsed);
		}
		
		sb.append(",\n");
		for (int i = 0; i < indentLevel + 1; i++) {
			sb.append("\t");
		}
		if (serverCertificate != null) {
			sb.append("serverCertificate: ");
			serverCertificate.appendAsString(sb, indentLevel + 1);
		}
		else {
			sb.append("serverCertificate: <empty-required-field>");
		}
		
		sb.append(",\n");
		for (int i = 0; i < indentLevel + 1; i++) {
			sb.append("\t");
		}
		if (ctxParams1 != null) {
			sb.append("ctxParams1: ");
			ctxParams1.appendAsString(sb, indentLevel + 1);
		}
		else {
			sb.append("ctxParams1: <empty-required-field>");
		}
		
		if (otherCertsInChain != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("otherCertsInChain: ");
			otherCertsInChain.appendAsString(sb, indentLevel + 1);
		}
		
		if (crlList != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("crlList: ");
			crlList.appendAsString(sb, indentLevel + 1);
		}
		
		sb.append("\n");
		for (int i = 0; i < indentLevel; i++) {
			sb.append("\t");
		}
		sb.append("}");
	}

}

