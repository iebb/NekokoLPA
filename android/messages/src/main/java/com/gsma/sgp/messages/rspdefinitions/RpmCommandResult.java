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

public class RpmCommandResult implements BerType, Serializable {

	private static final long serialVersionUID = 1L;

	public static class RpmCommandResultData implements BerType, Serializable {

		private static final long serialVersionUID = 1L;

		public byte[] code = null;
		private EnableProfileResponse enableResult = null;
		private DisableProfileResponse disableResult = null;
		private DeleteProfileResponse deleteResult = null;
		private ProfileInfoListResponse listProfileInfoResult = null;
		private UpdateMetadataResponse updateMetadataResult = null;
		private ContactPcmpResponse contactPcmpResult = null;
		private BerInteger rpmProcessingTerminated = null;
		
		public RpmCommandResultData() {
		}

		public RpmCommandResultData(byte[] code) {
			this.code = code;
		}

		public void setEnableResult(EnableProfileResponse enableResult) {
			this.enableResult = enableResult;
		}

		public EnableProfileResponse getEnableResult() {
			return enableResult;
		}

		public void setDisableResult(DisableProfileResponse disableResult) {
			this.disableResult = disableResult;
		}

		public DisableProfileResponse getDisableResult() {
			return disableResult;
		}

		public void setDeleteResult(DeleteProfileResponse deleteResult) {
			this.deleteResult = deleteResult;
		}

		public DeleteProfileResponse getDeleteResult() {
			return deleteResult;
		}

		public void setListProfileInfoResult(ProfileInfoListResponse listProfileInfoResult) {
			this.listProfileInfoResult = listProfileInfoResult;
		}

		public ProfileInfoListResponse getListProfileInfoResult() {
			return listProfileInfoResult;
		}

		public void setUpdateMetadataResult(UpdateMetadataResponse updateMetadataResult) {
			this.updateMetadataResult = updateMetadataResult;
		}

		public UpdateMetadataResponse getUpdateMetadataResult() {
			return updateMetadataResult;
		}

		public void setContactPcmpResult(ContactPcmpResponse contactPcmpResult) {
			this.contactPcmpResult = contactPcmpResult;
		}

		public ContactPcmpResponse getContactPcmpResult() {
			return contactPcmpResult;
		}

		public void setRpmProcessingTerminated(BerInteger rpmProcessingTerminated) {
			this.rpmProcessingTerminated = rpmProcessingTerminated;
		}

		public BerInteger getRpmProcessingTerminated() {
			return rpmProcessingTerminated;
		}

		public int encode(OutputStream reverseOS) throws IOException {

			if (code != null) {
				for (int i = code.length - 1; i >= 0; i--) {
					reverseOS.write(code[i]);
				}
				return code.length;
			}

			int codeLength = 0;
			int sublength;

			if (rpmProcessingTerminated != null) {
				codeLength += rpmProcessingTerminated.encode(reverseOS, true);
				return codeLength;
			}
			
			if (contactPcmpResult != null) {
				sublength = contactPcmpResult.encode(reverseOS);
				codeLength += sublength;
				codeLength += BerLength.encodeLength(reverseOS, sublength);
				// write tag: CONTEXT_CLASS, CONSTRUCTED, 0
				reverseOS.write(0xA0);
				codeLength += 1;
				return codeLength;
			}
			
			if (updateMetadataResult != null) {
				codeLength += updateMetadataResult.encode(reverseOS, false);
				// write tag: CONTEXT_CLASS, PRIMITIVE, 42
				reverseOS.write(0x2A);
				reverseOS.write(0x9F);
				codeLength += 2;
				return codeLength;
			}
			
			if (listProfileInfoResult != null) {
				codeLength += listProfileInfoResult.encode(reverseOS, false);
				// write tag: CONTEXT_CLASS, CONSTRUCTED, 45
				reverseOS.write(0x2D);
				reverseOS.write(0xBF);
				codeLength += 2;
				return codeLength;
			}
			
			if (deleteResult != null) {
				codeLength += deleteResult.encode(reverseOS, false);
				// write tag: CONTEXT_CLASS, CONSTRUCTED, 51
				reverseOS.write(0x33);
				reverseOS.write(0xBF);
				codeLength += 2;
				return codeLength;
			}
			
			if (disableResult != null) {
				codeLength += disableResult.encode(reverseOS, false);
				// write tag: CONTEXT_CLASS, CONSTRUCTED, 50
				reverseOS.write(0x32);
				reverseOS.write(0xBF);
				codeLength += 2;
				return codeLength;
			}
			
			if (enableResult != null) {
				codeLength += enableResult.encode(reverseOS, false);
				// write tag: CONTEXT_CLASS, CONSTRUCTED, 49
				reverseOS.write(0x31);
				reverseOS.write(0xBF);
				codeLength += 2;
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

			if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 49)) {
				enableResult = new EnableProfileResponse();
				codeLength += enableResult.decode(is, false);
				return codeLength;
			}

			if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 50)) {
				disableResult = new DisableProfileResponse();
				codeLength += disableResult.decode(is, false);
				return codeLength;
			}

			if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 51)) {
				deleteResult = new DeleteProfileResponse();
				codeLength += deleteResult.decode(is, false);
				return codeLength;
			}

			if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 45)) {
				listProfileInfoResult = new ProfileInfoListResponse();
				codeLength += listProfileInfoResult.decode(is, false);
				return codeLength;
			}

			if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 42)) {
				updateMetadataResult = new UpdateMetadataResponse();
				codeLength += updateMetadataResult.decode(is, false);
				return codeLength;
			}

			if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 0)) {
				codeLength += new BerLength().decode(is);
				contactPcmpResult = new ContactPcmpResponse();
				codeLength += contactPcmpResult.decode(is, null);
				return codeLength;
			}

			if (berTag.equals(BerInteger.tag)) {
				rpmProcessingTerminated = new BerInteger();
				codeLength += rpmProcessingTerminated.decode(is, false);
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

			if (enableResult != null) {
				sb.append("enableResult: ");
				enableResult.appendAsString(sb, indentLevel + 1);
				return;
			}

			if (disableResult != null) {
				sb.append("disableResult: ");
				disableResult.appendAsString(sb, indentLevel + 1);
				return;
			}

			if (deleteResult != null) {
				sb.append("deleteResult: ");
				deleteResult.appendAsString(sb, indentLevel + 1);
				return;
			}

			if (listProfileInfoResult != null) {
				sb.append("listProfileInfoResult: ");
				listProfileInfoResult.appendAsString(sb, indentLevel + 1);
				return;
			}

			if (updateMetadataResult != null) {
				sb.append("updateMetadataResult: ").append(updateMetadataResult);
				return;
			}

			if (contactPcmpResult != null) {
				sb.append("contactPcmpResult: ");
				contactPcmpResult.appendAsString(sb, indentLevel + 1);
				return;
			}

			if (rpmProcessingTerminated != null) {
				sb.append("rpmProcessingTerminated: ").append(rpmProcessingTerminated);
				return;
			}

			sb.append("<none>");
		}

	}

	public static final BerTag tag = new BerTag(BerTag.UNIVERSAL_CLASS, BerTag.CONSTRUCTED, 16);

	public byte[] code = null;
	private Iccid iccid = null;
	private RpmCommandResultData rpmCommandResultData = null;
	
	public RpmCommandResult() {
	}

	public RpmCommandResult(byte[] code) {
		this.code = code;
	}

	public void setIccid(Iccid iccid) {
		this.iccid = iccid;
	}

	public Iccid getIccid() {
		return iccid;
	}

	public void setRpmCommandResultData(RpmCommandResultData rpmCommandResultData) {
		this.rpmCommandResultData = rpmCommandResultData;
	}

	public RpmCommandResultData getRpmCommandResultData() {
		return rpmCommandResultData;
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
		codeLength += rpmCommandResultData.encode(reverseOS);
		
		if (iccid != null) {
			codeLength += iccid.encode(reverseOS, false);
			// write tag: APPLICATION_CLASS, PRIMITIVE, 26
			reverseOS.write(0x5A);
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
		if (berTag.equals(BerTag.APPLICATION_CLASS, BerTag.PRIMITIVE, 26)) {
			iccid = new Iccid();
			subCodeLength += iccid.decode(is, false);
			subCodeLength += berTag.decode(is);
		}
		
		rpmCommandResultData = new RpmCommandResultData();
		subCodeLength += rpmCommandResultData.decode(is, berTag);
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
		if (iccid != null) {
			sb.append("\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("iccid: ").append(iccid);
			firstSelectedElement = false;
		}
		
		if (!firstSelectedElement) {
			sb.append(",\n");
		}
		for (int i = 0; i < indentLevel + 1; i++) {
			sb.append("\t");
		}
		if (rpmCommandResultData != null) {
			sb.append("rpmCommandResultData: ");
			rpmCommandResultData.appendAsString(sb, indentLevel + 1);
		}
		else {
			sb.append("rpmCommandResultData: <empty-required-field>");
		}
		
		sb.append("\n");
		for (int i = 0; i < indentLevel; i++) {
			sb.append("\t");
		}
		sb.append("}");
	}

}

