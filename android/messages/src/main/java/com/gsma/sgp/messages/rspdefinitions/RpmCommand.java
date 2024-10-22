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

public class RpmCommand implements BerType, Serializable {

	private static final long serialVersionUID = 1L;

	public static class RpmCommandDetails implements BerType, Serializable {

		private static final long serialVersionUID = 1L;

		public byte[] code = null;
		public static class Enable implements BerType, Serializable {

			private static final long serialVersionUID = 1L;

			public static final BerTag tag = new BerTag(BerTag.UNIVERSAL_CLASS, BerTag.CONSTRUCTED, 16);

			public byte[] code = null;
			private Iccid iccid = null;
			
			public Enable() {
			}

			public Enable(byte[] code) {
				this.code = code;
			}

			public void setIccid(Iccid iccid) {
				this.iccid = iccid;
			}

			public Iccid getIccid() {
				return iccid;
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
				codeLength += iccid.encode(reverseOS, false);
				// write tag: APPLICATION_CLASS, PRIMITIVE, 26
				reverseOS.write(0x5A);
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
				if (berTag.equals(BerTag.APPLICATION_CLASS, BerTag.PRIMITIVE, 26)) {
					iccid = new Iccid();
					subCodeLength += iccid.decode(is, false);
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
				if (iccid != null) {
					sb.append("iccid: ").append(iccid);
				}
				else {
					sb.append("iccid: <empty-required-field>");
				}
				
				sb.append("\n");
				for (int i = 0; i < indentLevel; i++) {
					sb.append("\t");
				}
				sb.append("}");
			}

		}

		public static class Disable implements BerType, Serializable {

			private static final long serialVersionUID = 1L;

			public static final BerTag tag = new BerTag(BerTag.UNIVERSAL_CLASS, BerTag.CONSTRUCTED, 16);

			public byte[] code = null;
			private Iccid iccid = null;
			
			public Disable() {
			}

			public Disable(byte[] code) {
				this.code = code;
			}

			public void setIccid(Iccid iccid) {
				this.iccid = iccid;
			}

			public Iccid getIccid() {
				return iccid;
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
				codeLength += iccid.encode(reverseOS, false);
				// write tag: APPLICATION_CLASS, PRIMITIVE, 26
				reverseOS.write(0x5A);
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
				if (berTag.equals(BerTag.APPLICATION_CLASS, BerTag.PRIMITIVE, 26)) {
					iccid = new Iccid();
					subCodeLength += iccid.decode(is, false);
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
				if (iccid != null) {
					sb.append("iccid: ").append(iccid);
				}
				else {
					sb.append("iccid: <empty-required-field>");
				}
				
				sb.append("\n");
				for (int i = 0; i < indentLevel; i++) {
					sb.append("\t");
				}
				sb.append("}");
			}

		}

		public static class Delete implements BerType, Serializable {

			private static final long serialVersionUID = 1L;

			public static final BerTag tag = new BerTag(BerTag.UNIVERSAL_CLASS, BerTag.CONSTRUCTED, 16);

			public byte[] code = null;
			private Iccid iccid = null;
			
			public Delete() {
			}

			public Delete(byte[] code) {
				this.code = code;
			}

			public void setIccid(Iccid iccid) {
				this.iccid = iccid;
			}

			public Iccid getIccid() {
				return iccid;
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
				codeLength += iccid.encode(reverseOS, false);
				// write tag: APPLICATION_CLASS, PRIMITIVE, 26
				reverseOS.write(0x5A);
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
				if (berTag.equals(BerTag.APPLICATION_CLASS, BerTag.PRIMITIVE, 26)) {
					iccid = new Iccid();
					subCodeLength += iccid.decode(is, false);
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
				if (iccid != null) {
					sb.append("iccid: ").append(iccid);
				}
				else {
					sb.append("iccid: <empty-required-field>");
				}
				
				sb.append("\n");
				for (int i = 0; i < indentLevel; i++) {
					sb.append("\t");
				}
				sb.append("}");
			}

		}

		public static class UpdateMetadata implements BerType, Serializable {

			private static final long serialVersionUID = 1L;

			public static final BerTag tag = new BerTag(BerTag.UNIVERSAL_CLASS, BerTag.CONSTRUCTED, 16);

			public byte[] code = null;
			private Iccid iccid = null;
			private UpdateMetadataRequest updateMetadataRequest = null;
			
			public UpdateMetadata() {
			}

			public UpdateMetadata(byte[] code) {
				this.code = code;
			}

			public void setIccid(Iccid iccid) {
				this.iccid = iccid;
			}

			public Iccid getIccid() {
				return iccid;
			}

			public void setUpdateMetadataRequest(UpdateMetadataRequest updateMetadataRequest) {
				this.updateMetadataRequest = updateMetadataRequest;
			}

			public UpdateMetadataRequest getUpdateMetadataRequest() {
				return updateMetadataRequest;
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
				codeLength += updateMetadataRequest.encode(reverseOS, true);
				
				codeLength += iccid.encode(reverseOS, false);
				// write tag: APPLICATION_CLASS, PRIMITIVE, 26
				reverseOS.write(0x5A);
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
				if (berTag.equals(BerTag.APPLICATION_CLASS, BerTag.PRIMITIVE, 26)) {
					iccid = new Iccid();
					subCodeLength += iccid.decode(is, false);
					subCodeLength += berTag.decode(is);
				}
				else {
					throw new IOException("Tag does not match the mandatory sequence element tag.");
				}
				
				if (berTag.equals(UpdateMetadataRequest.tag)) {
					updateMetadataRequest = new UpdateMetadataRequest();
					subCodeLength += updateMetadataRequest.decode(is, false);
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
				if (iccid != null) {
					sb.append("iccid: ").append(iccid);
				}
				else {
					sb.append("iccid: <empty-required-field>");
				}
				
				sb.append(",\n");
				for (int i = 0; i < indentLevel + 1; i++) {
					sb.append("\t");
				}
				if (updateMetadataRequest != null) {
					sb.append("updateMetadataRequest: ");
					updateMetadataRequest.appendAsString(sb, indentLevel + 1);
				}
				else {
					sb.append("updateMetadataRequest: <empty-required-field>");
				}
				
				sb.append("\n");
				for (int i = 0; i < indentLevel; i++) {
					sb.append("\t");
				}
				sb.append("}");
			}

		}

		public static class ContactPcmp implements BerType, Serializable {

			private static final long serialVersionUID = 1L;

			public static final BerTag tag = new BerTag(BerTag.UNIVERSAL_CLASS, BerTag.CONSTRUCTED, 16);

			public byte[] code = null;
			private Iccid iccid = null;
			private BerUTF8String dpiRpm = null;
			
			public ContactPcmp() {
			}

			public ContactPcmp(byte[] code) {
				this.code = code;
			}

			public void setIccid(Iccid iccid) {
				this.iccid = iccid;
			}

			public Iccid getIccid() {
				return iccid;
			}

			public void setDpiRpm(BerUTF8String dpiRpm) {
				this.dpiRpm = dpiRpm;
			}

			public BerUTF8String getDpiRpm() {
				return dpiRpm;
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
				if (dpiRpm != null) {
					codeLength += dpiRpm.encode(reverseOS, true);
				}
				
				codeLength += iccid.encode(reverseOS, false);
				// write tag: APPLICATION_CLASS, PRIMITIVE, 26
				reverseOS.write(0x5A);
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
				if (berTag.equals(BerTag.APPLICATION_CLASS, BerTag.PRIMITIVE, 26)) {
					iccid = new Iccid();
					subCodeLength += iccid.decode(is, false);
					if (subCodeLength == totalLength) {
						return codeLength;
					}
					subCodeLength += berTag.decode(is);
				}
				else {
					throw new IOException("Tag does not match the mandatory sequence element tag.");
				}
				
				if (berTag.equals(BerUTF8String.tag)) {
					dpiRpm = new BerUTF8String();
					subCodeLength += dpiRpm.decode(is, false);
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
				if (iccid != null) {
					sb.append("iccid: ").append(iccid);
				}
				else {
					sb.append("iccid: <empty-required-field>");
				}
				
				if (dpiRpm != null) {
					sb.append(",\n");
					for (int i = 0; i < indentLevel + 1; i++) {
						sb.append("\t");
					}
					sb.append("dpiRpm: ").append(dpiRpm);
				}
				
				sb.append("\n");
				for (int i = 0; i < indentLevel; i++) {
					sb.append("\t");
				}
				sb.append("}");
			}

		}

		private Enable enable = null;
		private Disable disable = null;
		private Delete delete = null;
		private ListProfileInfo listProfileInfo = null;
		private UpdateMetadata updateMetadata = null;
		private ContactPcmp contactPcmp = null;
		
		public RpmCommandDetails() {
		}

		public RpmCommandDetails(byte[] code) {
			this.code = code;
		}

		public void setEnable(Enable enable) {
			this.enable = enable;
		}

		public Enable getEnable() {
			return enable;
		}

		public void setDisable(Disable disable) {
			this.disable = disable;
		}

		public Disable getDisable() {
			return disable;
		}

		public void setDelete(Delete delete) {
			this.delete = delete;
		}

		public Delete getDelete() {
			return delete;
		}

		public void setListProfileInfo(ListProfileInfo listProfileInfo) {
			this.listProfileInfo = listProfileInfo;
		}

		public ListProfileInfo getListProfileInfo() {
			return listProfileInfo;
		}

		public void setUpdateMetadata(UpdateMetadata updateMetadata) {
			this.updateMetadata = updateMetadata;
		}

		public UpdateMetadata getUpdateMetadata() {
			return updateMetadata;
		}

		public void setContactPcmp(ContactPcmp contactPcmp) {
			this.contactPcmp = contactPcmp;
		}

		public ContactPcmp getContactPcmp() {
			return contactPcmp;
		}

		public int encode(OutputStream reverseOS) throws IOException {

			if (code != null) {
				for (int i = code.length - 1; i >= 0; i--) {
					reverseOS.write(code[i]);
				}
				return code.length;
			}

			int codeLength = 0;
			if (contactPcmp != null) {
				codeLength += contactPcmp.encode(reverseOS, false);
				// write tag: CONTEXT_CLASS, CONSTRUCTED, 6
				reverseOS.write(0xA6);
				codeLength += 1;
				return codeLength;
			}
			
			if (updateMetadata != null) {
				codeLength += updateMetadata.encode(reverseOS, false);
				// write tag: CONTEXT_CLASS, CONSTRUCTED, 5
				reverseOS.write(0xA5);
				codeLength += 1;
				return codeLength;
			}
			
			if (listProfileInfo != null) {
				codeLength += listProfileInfo.encode(reverseOS, false);
				// write tag: CONTEXT_CLASS, CONSTRUCTED, 4
				reverseOS.write(0xA4);
				codeLength += 1;
				return codeLength;
			}
			
			if (delete != null) {
				codeLength += delete.encode(reverseOS, false);
				// write tag: CONTEXT_CLASS, CONSTRUCTED, 3
				reverseOS.write(0xA3);
				codeLength += 1;
				return codeLength;
			}
			
			if (disable != null) {
				codeLength += disable.encode(reverseOS, false);
				// write tag: CONTEXT_CLASS, CONSTRUCTED, 2
				reverseOS.write(0xA2);
				codeLength += 1;
				return codeLength;
			}
			
			if (enable != null) {
				codeLength += enable.encode(reverseOS, false);
				// write tag: CONTEXT_CLASS, CONSTRUCTED, 1
				reverseOS.write(0xA1);
				codeLength += 1;
				return codeLength;
			}
			
			throw new IOException("Error encoding CHOICE: No element of CHOICE was selected.");
		}

		public int decode(InputStream is) throws IOException {
			return decode(is, null);
		}

		public int decode(InputStream is, BerTag berTag) throws IOException {

			int codeLength = 0;
			BerTag passedTag = berTag;

			if (berTag == null) {
				berTag = new BerTag();
				codeLength += berTag.decode(is);
			}

			if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 1)) {
				enable = new Enable();
				codeLength += enable.decode(is, false);
				return codeLength;
			}

			if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 2)) {
				disable = new Disable();
				codeLength += disable.decode(is, false);
				return codeLength;
			}

			if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 3)) {
				delete = new Delete();
				codeLength += delete.decode(is, false);
				return codeLength;
			}

			if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 4)) {
				listProfileInfo = new ListProfileInfo();
				codeLength += listProfileInfo.decode(is, false);
				return codeLength;
			}

			if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 5)) {
				updateMetadata = new UpdateMetadata();
				codeLength += updateMetadata.decode(is, false);
				return codeLength;
			}

			if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 6)) {
				contactPcmp = new ContactPcmp();
				codeLength += contactPcmp.decode(is, false);
				return codeLength;
			}

			if (passedTag != null) {
				return 0;
			}

			throw new IOException("Error decoding CHOICE: Tag " + berTag + " matched to no item.");
		}

		public void encodeAndSave(int encodingSizeGuess) throws IOException {
			ReverseByteArrayOutputStream reverseOS = new ReverseByteArrayOutputStream(encodingSizeGuess);
			encode(reverseOS);
			code = reverseOS.getArray();
		}

		public String toString() {
			StringBuilder sb = new StringBuilder();
			appendAsString(sb, 0);
			return sb.toString();
		}

		public void appendAsString(StringBuilder sb, int indentLevel) {

			if (enable != null) {
				sb.append("enable: ");
				enable.appendAsString(sb, indentLevel + 1);
				return;
			}

			if (disable != null) {
				sb.append("disable: ");
				disable.appendAsString(sb, indentLevel + 1);
				return;
			}

			if (delete != null) {
				sb.append("delete: ");
				delete.appendAsString(sb, indentLevel + 1);
				return;
			}

			if (listProfileInfo != null) {
				sb.append("listProfileInfo: ");
				listProfileInfo.appendAsString(sb, indentLevel + 1);
				return;
			}

			if (updateMetadata != null) {
				sb.append("updateMetadata: ");
				updateMetadata.appendAsString(sb, indentLevel + 1);
				return;
			}

			if (contactPcmp != null) {
				sb.append("contactPcmp: ");
				contactPcmp.appendAsString(sb, indentLevel + 1);
				return;
			}

			sb.append("<none>");
		}

	}

	public static final BerTag tag = new BerTag(BerTag.UNIVERSAL_CLASS, BerTag.CONSTRUCTED, 16);

	public byte[] code = null;
	private BerNull continueOnFailure = null;
	private RpmCommandDetails rpmCommandDetails = null;
	
	public RpmCommand() {
	}

	public RpmCommand(byte[] code) {
		this.code = code;
	}

	public void setContinueOnFailure(BerNull continueOnFailure) {
		this.continueOnFailure = continueOnFailure;
	}

	public BerNull getContinueOnFailure() {
		return continueOnFailure;
	}

	public void setRpmCommandDetails(RpmCommandDetails rpmCommandDetails) {
		this.rpmCommandDetails = rpmCommandDetails;
	}

	public RpmCommandDetails getRpmCommandDetails() {
		return rpmCommandDetails;
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
		codeLength += rpmCommandDetails.encode(reverseOS);
		
		if (continueOnFailure != null) {
			codeLength += continueOnFailure.encode(reverseOS, false);
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
			continueOnFailure = new BerNull();
			subCodeLength += continueOnFailure.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		
		rpmCommandDetails = new RpmCommandDetails();
		subCodeLength += rpmCommandDetails.decode(is, berTag);
		if (subCodeLength == totalLength) {
			return codeLength;
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
		if (continueOnFailure != null) {
			sb.append("\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("continueOnFailure: ").append(continueOnFailure);
			firstSelectedElement = false;
		}
		
		if (!firstSelectedElement) {
			sb.append(",\n");
		}
		for (int i = 0; i < indentLevel + 1; i++) {
			sb.append("\t");
		}
		if (rpmCommandDetails != null) {
			sb.append("rpmCommandDetails: ");
			rpmCommandDetails.appendAsString(sb, indentLevel + 1);
		}
		else {
			sb.append("rpmCommandDetails: <empty-required-field>");
		}
		
		sb.append("\n");
		for (int i = 0; i < indentLevel; i++) {
			sb.append("\t");
		}
		sb.append("}");
	}

}

