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

public class E4EResponse implements BerType, Serializable {

	private static final long serialVersionUID = 1L;

	public static class ResultData implements BerType, Serializable {

		private static final long serialVersionUID = 1L;

		public byte[] code = null;
		public static class StartDownloadResponse implements BerType, Serializable {

			private static final long serialVersionUID = 1L;

			public static final BerTag tag = new BerTag(BerTag.UNIVERSAL_CLASS, BerTag.CONSTRUCTED, 16);

			public byte[] code = null;
			private BerUTF8String serviceProviderName = null;
			private BerUTF8String profileName = null;
			private BerNull ccRequired = null;
			
			public StartDownloadResponse() {
			}

			public StartDownloadResponse(byte[] code) {
				this.code = code;
			}

			public void setServiceProviderName(BerUTF8String serviceProviderName) {
				this.serviceProviderName = serviceProviderName;
			}

			public BerUTF8String getServiceProviderName() {
				return serviceProviderName;
			}

			public void setProfileName(BerUTF8String profileName) {
				this.profileName = profileName;
			}

			public BerUTF8String getProfileName() {
				return profileName;
			}

			public void setCcRequired(BerNull ccRequired) {
				this.ccRequired = ccRequired;
			}

			public BerNull getCcRequired() {
				return ccRequired;
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
				if (ccRequired != null) {
					codeLength += ccRequired.encode(reverseOS, false);
					// write tag: CONTEXT_CLASS, PRIMITIVE, 0
					reverseOS.write(0x80);
					codeLength += 1;
				}
				
				codeLength += profileName.encode(reverseOS, false);
				// write tag: CONTEXT_CLASS, PRIMITIVE, 18
				reverseOS.write(0x92);
				codeLength += 1;
				
				codeLength += serviceProviderName.encode(reverseOS, false);
				// write tag: CONTEXT_CLASS, PRIMITIVE, 17
				reverseOS.write(0x91);
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
				if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 17)) {
					serviceProviderName = new BerUTF8String();
					subCodeLength += serviceProviderName.decode(is, false);
					subCodeLength += berTag.decode(is);
				}
				else {
					throw new IOException("Tag does not match the mandatory sequence element tag.");
				}
				
				if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 18)) {
					profileName = new BerUTF8String();
					subCodeLength += profileName.decode(is, false);
					if (subCodeLength == totalLength) {
						return codeLength;
					}
					subCodeLength += berTag.decode(is);
				}
				else {
					throw new IOException("Tag does not match the mandatory sequence element tag.");
				}
				
				if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 0)) {
					ccRequired = new BerNull();
					subCodeLength += ccRequired.decode(is, false);
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
				if (serviceProviderName != null) {
					sb.append("serviceProviderName: ").append(serviceProviderName);
				}
				else {
					sb.append("serviceProviderName: <empty-required-field>");
				}
				
				sb.append(",\n");
				for (int i = 0; i < indentLevel + 1; i++) {
					sb.append("\t");
				}
				if (profileName != null) {
					sb.append("profileName: ").append(profileName);
				}
				else {
					sb.append("profileName: <empty-required-field>");
				}
				
				if (ccRequired != null) {
					sb.append(",\n");
					for (int i = 0; i < indentLevel + 1; i++) {
						sb.append("\t");
					}
					sb.append("ccRequired: ").append(ccRequired);
				}
				
				sb.append("\n");
				for (int i = 0; i < indentLevel; i++) {
					sb.append("\t");
				}
				sb.append("}");
			}

		}

		public static class ListProfilesResponse implements BerType, Serializable {

			private static final long serialVersionUID = 1L;

			public static class SEQUENCE implements BerType, Serializable {

				private static final long serialVersionUID = 1L;

				public static final BerTag tag = new BerTag(BerTag.UNIVERSAL_CLASS, BerTag.CONSTRUCTED, 16);

				public byte[] code = null;
				private Iccid iccid = null;
				private ProfileState profileState = null;
				private BerUTF8String serviceProviderName = null;
				private BerUTF8String profileName = null;
				
				public SEQUENCE() {
				}

				public SEQUENCE(byte[] code) {
					this.code = code;
				}

				public void setIccid(Iccid iccid) {
					this.iccid = iccid;
				}

				public Iccid getIccid() {
					return iccid;
				}

				public void setProfileState(ProfileState profileState) {
					this.profileState = profileState;
				}

				public ProfileState getProfileState() {
					return profileState;
				}

				public void setServiceProviderName(BerUTF8String serviceProviderName) {
					this.serviceProviderName = serviceProviderName;
				}

				public BerUTF8String getServiceProviderName() {
					return serviceProviderName;
				}

				public void setProfileName(BerUTF8String profileName) {
					this.profileName = profileName;
				}

				public BerUTF8String getProfileName() {
					return profileName;
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
					codeLength += profileName.encode(reverseOS, false);
					// write tag: CONTEXT_CLASS, PRIMITIVE, 18
					reverseOS.write(0x92);
					codeLength += 1;
					
					codeLength += serviceProviderName.encode(reverseOS, false);
					// write tag: CONTEXT_CLASS, PRIMITIVE, 17
					reverseOS.write(0x91);
					codeLength += 1;
					
					codeLength += profileState.encode(reverseOS, false);
					// write tag: CONTEXT_CLASS, PRIMITIVE, 112
					reverseOS.write(0x70);
					reverseOS.write(0x9F);
					codeLength += 2;
					
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
					
					if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 112)) {
						profileState = new ProfileState();
						subCodeLength += profileState.decode(is, false);
						subCodeLength += berTag.decode(is);
					}
					else {
						throw new IOException("Tag does not match the mandatory sequence element tag.");
					}
					
					if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 17)) {
						serviceProviderName = new BerUTF8String();
						subCodeLength += serviceProviderName.decode(is, false);
						subCodeLength += berTag.decode(is);
					}
					else {
						throw new IOException("Tag does not match the mandatory sequence element tag.");
					}
					
					if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 18)) {
						profileName = new BerUTF8String();
						subCodeLength += profileName.decode(is, false);
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
					if (profileState != null) {
						sb.append("profileState: ").append(profileState);
					}
					else {
						sb.append("profileState: <empty-required-field>");
					}
					
					sb.append(",\n");
					for (int i = 0; i < indentLevel + 1; i++) {
						sb.append("\t");
					}
					if (serviceProviderName != null) {
						sb.append("serviceProviderName: ").append(serviceProviderName);
					}
					else {
						sb.append("serviceProviderName: <empty-required-field>");
					}
					
					sb.append(",\n");
					for (int i = 0; i < indentLevel + 1; i++) {
						sb.append("\t");
					}
					if (profileName != null) {
						sb.append("profileName: ").append(profileName);
					}
					else {
						sb.append("profileName: <empty-required-field>");
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

			public ListProfilesResponse() {
				seqOf = new ArrayList<SEQUENCE>();
			}

			public ListProfilesResponse(byte[] code) {
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

		public static class PollRpmPackageResponse implements BerType, Serializable {

			private static final long serialVersionUID = 1L;

			public static final BerTag tag = new BerTag(BerTag.UNIVERSAL_CLASS, BerTag.CONSTRUCTED, 16);

			public byte[] code = null;
			private RpmPackage rpmPackage = null;
			private BerNull rpmPending = null;
			
			public PollRpmPackageResponse() {
			}

			public PollRpmPackageResponse(byte[] code) {
				this.code = code;
			}

			public void setRpmPackage(RpmPackage rpmPackage) {
				this.rpmPackage = rpmPackage;
			}

			public RpmPackage getRpmPackage() {
				return rpmPackage;
			}

			public void setRpmPending(BerNull rpmPending) {
				this.rpmPending = rpmPending;
			}

			public BerNull getRpmPending() {
				return rpmPending;
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
				if (rpmPending != null) {
					codeLength += rpmPending.encode(reverseOS, false);
					// write tag: CONTEXT_CLASS, PRIMITIVE, 1
					reverseOS.write(0x81);
					codeLength += 1;
				}
				
				codeLength += rpmPackage.encode(reverseOS, false);
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
					rpmPackage = new RpmPackage();
					subCodeLength += rpmPackage.decode(is, false);
					if (subCodeLength == totalLength) {
						return codeLength;
					}
					subCodeLength += berTag.decode(is);
				}
				else {
					throw new IOException("Tag does not match the mandatory sequence element tag.");
				}
				
				if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.PRIMITIVE, 1)) {
					rpmPending = new BerNull();
					subCodeLength += rpmPending.decode(is, false);
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
				if (rpmPackage != null) {
					sb.append("rpmPackage: ");
					rpmPackage.appendAsString(sb, indentLevel + 1);
				}
				else {
					sb.append("rpmPackage: <empty-required-field>");
				}
				
				if (rpmPending != null) {
					sb.append(",\n");
					for (int i = 0; i < indentLevel + 1; i++) {
						sb.append("\t");
					}
					sb.append("rpmPending: ").append(rpmPending);
				}
				
				sb.append("\n");
				for (int i = 0; i < indentLevel; i++) {
					sb.append("\t");
				}
				sb.append("}");
			}

		}

		public static class ConfirmDownloadResponse implements BerType, Serializable {

			private static final long serialVersionUID = 1L;

			public static final BerTag tag = new BerTag(BerTag.UNIVERSAL_CLASS, BerTag.CONSTRUCTED, 16);

			public byte[] code = null;
			private Iccid iccid = null;
			
			public ConfirmDownloadResponse() {
			}

			public ConfirmDownloadResponse(byte[] code) {
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

		private StartDownloadResponse startDownloadResponse = null;
		private ListProfilesResponse listProfilesResponse = null;
		private PollRpmPackageResponse pollRpmPackageResponse = null;
		private ConfirmDownloadResponse confirmDownloadResponse = null;
		
		public ResultData() {
		}

		public ResultData(byte[] code) {
			this.code = code;
		}

		public void setStartDownloadResponse(StartDownloadResponse startDownloadResponse) {
			this.startDownloadResponse = startDownloadResponse;
		}

		public StartDownloadResponse getStartDownloadResponse() {
			return startDownloadResponse;
		}

		public void setListProfilesResponse(ListProfilesResponse listProfilesResponse) {
			this.listProfilesResponse = listProfilesResponse;
		}

		public ListProfilesResponse getListProfilesResponse() {
			return listProfilesResponse;
		}

		public void setPollRpmPackageResponse(PollRpmPackageResponse pollRpmPackageResponse) {
			this.pollRpmPackageResponse = pollRpmPackageResponse;
		}

		public PollRpmPackageResponse getPollRpmPackageResponse() {
			return pollRpmPackageResponse;
		}

		public void setConfirmDownloadResponse(ConfirmDownloadResponse confirmDownloadResponse) {
			this.confirmDownloadResponse = confirmDownloadResponse;
		}

		public ConfirmDownloadResponse getConfirmDownloadResponse() {
			return confirmDownloadResponse;
		}

		public int encode(OutputStream reverseOS) throws IOException {

			if (code != null) {
				for (int i = code.length - 1; i >= 0; i--) {
					reverseOS.write(code[i]);
				}
				return code.length;
			}

			int codeLength = 0;
			if (confirmDownloadResponse != null) {
				codeLength += confirmDownloadResponse.encode(reverseOS, false);
				// write tag: CONTEXT_CLASS, CONSTRUCTED, 5
				reverseOS.write(0xA5);
				codeLength += 1;
				return codeLength;
			}
			
			if (pollRpmPackageResponse != null) {
				codeLength += pollRpmPackageResponse.encode(reverseOS, false);
				// write tag: CONTEXT_CLASS, CONSTRUCTED, 4
				reverseOS.write(0xA4);
				codeLength += 1;
				return codeLength;
			}
			
			if (listProfilesResponse != null) {
				codeLength += listProfilesResponse.encode(reverseOS, false);
				// write tag: CONTEXT_CLASS, CONSTRUCTED, 3
				reverseOS.write(0xA3);
				codeLength += 1;
				return codeLength;
			}
			
			if (startDownloadResponse != null) {
				codeLength += startDownloadResponse.encode(reverseOS, false);
				// write tag: CONTEXT_CLASS, CONSTRUCTED, 0
				reverseOS.write(0xA0);
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

			if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 0)) {
				startDownloadResponse = new StartDownloadResponse();
				codeLength += startDownloadResponse.decode(is, false);
				return codeLength;
			}

			if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 3)) {
				listProfilesResponse = new ListProfilesResponse();
				codeLength += listProfilesResponse.decode(is, false);
				return codeLength;
			}

			if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 4)) {
				pollRpmPackageResponse = new PollRpmPackageResponse();
				codeLength += pollRpmPackageResponse.decode(is, false);
				return codeLength;
			}

			if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 5)) {
				confirmDownloadResponse = new ConfirmDownloadResponse();
				codeLength += confirmDownloadResponse.decode(is, false);
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

			if (startDownloadResponse != null) {
				sb.append("startDownloadResponse: ");
				startDownloadResponse.appendAsString(sb, indentLevel + 1);
				return;
			}

			if (listProfilesResponse != null) {
				sb.append("listProfilesResponse: ");
				listProfilesResponse.appendAsString(sb, indentLevel + 1);
				return;
			}

			if (pollRpmPackageResponse != null) {
				sb.append("pollRpmPackageResponse: ");
				pollRpmPackageResponse.appendAsString(sb, indentLevel + 1);
				return;
			}

			if (confirmDownloadResponse != null) {
				sb.append("confirmDownloadResponse: ");
				confirmDownloadResponse.appendAsString(sb, indentLevel + 1);
				return;
			}

			sb.append("<none>");
		}

	}

	public static final BerTag tag = new BerTag(BerTag.PRIVATE_CLASS, BerTag.CONSTRUCTED, 4);

	public byte[] code = null;
	private E4EResultCode resultCode = null;
	private ResultData resultData = null;
	
	public E4EResponse() {
	}

	public E4EResponse(byte[] code) {
		this.code = code;
	}

	public void setResultCode(E4EResultCode resultCode) {
		this.resultCode = resultCode;
	}

	public E4EResultCode getResultCode() {
		return resultCode;
	}

	public void setResultData(ResultData resultData) {
		this.resultData = resultData;
	}

	public ResultData getResultData() {
		return resultData;
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
		int sublength;

		if (resultData != null) {
			sublength = resultData.encode(reverseOS);
			codeLength += sublength;
			codeLength += BerLength.encodeLength(reverseOS, sublength);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 1
			reverseOS.write(0xA1);
			codeLength += 1;
		}
		
		codeLength += resultCode.encode(reverseOS, false);
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
			resultCode = new E4EResultCode();
			subCodeLength += resultCode.decode(is, false);
			if (subCodeLength == totalLength) {
				return codeLength;
			}
			subCodeLength += berTag.decode(is);
		}
		else {
			throw new IOException("Tag does not match the mandatory sequence element tag.");
		}
		
		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 1)) {
			subCodeLength += length.decode(is);
			resultData = new ResultData();
			subCodeLength += resultData.decode(is, null);
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
		if (resultCode != null) {
			sb.append("resultCode: ").append(resultCode);
		}
		else {
			sb.append("resultCode: <empty-required-field>");
		}
		
		if (resultData != null) {
			sb.append(",\n");
			for (int i = 0; i < indentLevel + 1; i++) {
				sb.append("\t");
			}
			sb.append("resultData: ");
			resultData.appendAsString(sb, indentLevel + 1);
		}
		
		sb.append("\n");
		for (int i = 0; i < indentLevel; i++) {
			sb.append("\t");
		}
		sb.append("}");
	}

}

