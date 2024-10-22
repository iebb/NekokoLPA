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

public class RemoteProfileProvisioningResponse implements BerType, Serializable {

	private static final long serialVersionUID = 1L;

	public byte[] code = null;
	public static final BerTag tag = new BerTag(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 2);

	private InitiateAuthenticationResponse initiateAuthenticationResponse = null;
	private AuthenticateClientResponseEs9 authenticateClientResponseEs9 = null;
	private GetBoundProfilePackageResponse getBoundProfilePackageResponse = null;
	private CancelSessionResponseEs9 cancelSessionResponseEs9 = null;
	private AuthenticateClientResponseEs11 authenticateClientResponseEs11 = null;
	private ConfirmDeviceChangeResponse confirmDeviceChangeResponse = null;
	private CheckEventResponse checkEventResponse = null;
	private CheckProgressResponse checkProgressResponse = null;
	
	public RemoteProfileProvisioningResponse() {
	}

	public RemoteProfileProvisioningResponse(byte[] code) {
		this.code = code;
	}

	public void setInitiateAuthenticationResponse(InitiateAuthenticationResponse initiateAuthenticationResponse) {
		this.initiateAuthenticationResponse = initiateAuthenticationResponse;
	}

	public InitiateAuthenticationResponse getInitiateAuthenticationResponse() {
		return initiateAuthenticationResponse;
	}

	public void setAuthenticateClientResponseEs9(AuthenticateClientResponseEs9 authenticateClientResponseEs9) {
		this.authenticateClientResponseEs9 = authenticateClientResponseEs9;
	}

	public AuthenticateClientResponseEs9 getAuthenticateClientResponseEs9() {
		return authenticateClientResponseEs9;
	}

	public void setGetBoundProfilePackageResponse(GetBoundProfilePackageResponse getBoundProfilePackageResponse) {
		this.getBoundProfilePackageResponse = getBoundProfilePackageResponse;
	}

	public GetBoundProfilePackageResponse getGetBoundProfilePackageResponse() {
		return getBoundProfilePackageResponse;
	}

	public void setCancelSessionResponseEs9(CancelSessionResponseEs9 cancelSessionResponseEs9) {
		this.cancelSessionResponseEs9 = cancelSessionResponseEs9;
	}

	public CancelSessionResponseEs9 getCancelSessionResponseEs9() {
		return cancelSessionResponseEs9;
	}

	public void setAuthenticateClientResponseEs11(AuthenticateClientResponseEs11 authenticateClientResponseEs11) {
		this.authenticateClientResponseEs11 = authenticateClientResponseEs11;
	}

	public AuthenticateClientResponseEs11 getAuthenticateClientResponseEs11() {
		return authenticateClientResponseEs11;
	}

	public void setConfirmDeviceChangeResponse(ConfirmDeviceChangeResponse confirmDeviceChangeResponse) {
		this.confirmDeviceChangeResponse = confirmDeviceChangeResponse;
	}

	public ConfirmDeviceChangeResponse getConfirmDeviceChangeResponse() {
		return confirmDeviceChangeResponse;
	}

	public void setCheckEventResponse(CheckEventResponse checkEventResponse) {
		this.checkEventResponse = checkEventResponse;
	}

	public CheckEventResponse getCheckEventResponse() {
		return checkEventResponse;
	}

	public void setCheckProgressResponse(CheckProgressResponse checkProgressResponse) {
		this.checkProgressResponse = checkProgressResponse;
	}

	public CheckProgressResponse getCheckProgressResponse() {
		return checkProgressResponse;
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
		if (checkProgressResponse != null) {
			codeLength += checkProgressResponse.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 97
			reverseOS.write(0x61);
			reverseOS.write(0xBF);
			codeLength += 2;
			codeLength += BerLength.encodeLength(reverseOS, codeLength);
			if (withTag) {
				codeLength += tag.encode(reverseOS);
			}
			return codeLength;
		}
		
		if (checkEventResponse != null) {
			codeLength += checkEventResponse.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 70
			reverseOS.write(0x46);
			reverseOS.write(0xBF);
			codeLength += 2;
			codeLength += BerLength.encodeLength(reverseOS, codeLength);
			if (withTag) {
				codeLength += tag.encode(reverseOS);
			}
			return codeLength;
		}
		
		if (confirmDeviceChangeResponse != null) {
			codeLength += confirmDeviceChangeResponse.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 76
			reverseOS.write(0x4C);
			reverseOS.write(0xBF);
			codeLength += 2;
			codeLength += BerLength.encodeLength(reverseOS, codeLength);
			if (withTag) {
				codeLength += tag.encode(reverseOS);
			}
			return codeLength;
		}
		
		if (authenticateClientResponseEs11 != null) {
			codeLength += authenticateClientResponseEs11.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 64
			reverseOS.write(0x40);
			reverseOS.write(0xBF);
			codeLength += 2;
			codeLength += BerLength.encodeLength(reverseOS, codeLength);
			if (withTag) {
				codeLength += tag.encode(reverseOS);
			}
			return codeLength;
		}
		
		if (cancelSessionResponseEs9 != null) {
			codeLength += cancelSessionResponseEs9.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 65
			reverseOS.write(0x41);
			reverseOS.write(0xBF);
			codeLength += 2;
			codeLength += BerLength.encodeLength(reverseOS, codeLength);
			if (withTag) {
				codeLength += tag.encode(reverseOS);
			}
			return codeLength;
		}
		
		if (getBoundProfilePackageResponse != null) {
			codeLength += getBoundProfilePackageResponse.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 58
			reverseOS.write(0x3A);
			reverseOS.write(0xBF);
			codeLength += 2;
			codeLength += BerLength.encodeLength(reverseOS, codeLength);
			if (withTag) {
				codeLength += tag.encode(reverseOS);
			}
			return codeLength;
		}
		
		if (authenticateClientResponseEs9 != null) {
			codeLength += authenticateClientResponseEs9.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 59
			reverseOS.write(0x3B);
			reverseOS.write(0xBF);
			codeLength += 2;
			codeLength += BerLength.encodeLength(reverseOS, codeLength);
			if (withTag) {
				codeLength += tag.encode(reverseOS);
			}
			return codeLength;
		}
		
		if (initiateAuthenticationResponse != null) {
			codeLength += initiateAuthenticationResponse.encode(reverseOS, false);
			// write tag: CONTEXT_CLASS, CONSTRUCTED, 57
			reverseOS.write(0x39);
			reverseOS.write(0xBF);
			codeLength += 2;
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

		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 57)) {
			initiateAuthenticationResponse = new InitiateAuthenticationResponse();
			codeLength += initiateAuthenticationResponse.decode(is, false);
			return codeLength;
		}

		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 59)) {
			authenticateClientResponseEs9 = new AuthenticateClientResponseEs9();
			codeLength += authenticateClientResponseEs9.decode(is, false);
			return codeLength;
		}

		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 58)) {
			getBoundProfilePackageResponse = new GetBoundProfilePackageResponse();
			codeLength += getBoundProfilePackageResponse.decode(is, false);
			return codeLength;
		}

		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 65)) {
			cancelSessionResponseEs9 = new CancelSessionResponseEs9();
			codeLength += cancelSessionResponseEs9.decode(is, false);
			return codeLength;
		}

		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 64)) {
			authenticateClientResponseEs11 = new AuthenticateClientResponseEs11();
			codeLength += authenticateClientResponseEs11.decode(is, false);
			return codeLength;
		}

		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 76)) {
			confirmDeviceChangeResponse = new ConfirmDeviceChangeResponse();
			codeLength += confirmDeviceChangeResponse.decode(is, false);
			return codeLength;
		}

		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 70)) {
			checkEventResponse = new CheckEventResponse();
			codeLength += checkEventResponse.decode(is, false);
			return codeLength;
		}

		if (berTag.equals(BerTag.CONTEXT_CLASS, BerTag.CONSTRUCTED, 97)) {
			checkProgressResponse = new CheckProgressResponse();
			codeLength += checkProgressResponse.decode(is, false);
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

		if (initiateAuthenticationResponse != null) {
			sb.append("initiateAuthenticationResponse: ");
			initiateAuthenticationResponse.appendAsString(sb, indentLevel + 1);
			return;
		}

		if (authenticateClientResponseEs9 != null) {
			sb.append("authenticateClientResponseEs9: ");
			authenticateClientResponseEs9.appendAsString(sb, indentLevel + 1);
			return;
		}

		if (getBoundProfilePackageResponse != null) {
			sb.append("getBoundProfilePackageResponse: ");
			getBoundProfilePackageResponse.appendAsString(sb, indentLevel + 1);
			return;
		}

		if (cancelSessionResponseEs9 != null) {
			sb.append("cancelSessionResponseEs9: ");
			cancelSessionResponseEs9.appendAsString(sb, indentLevel + 1);
			return;
		}

		if (authenticateClientResponseEs11 != null) {
			sb.append("authenticateClientResponseEs11: ");
			authenticateClientResponseEs11.appendAsString(sb, indentLevel + 1);
			return;
		}

		if (confirmDeviceChangeResponse != null) {
			sb.append("confirmDeviceChangeResponse: ");
			confirmDeviceChangeResponse.appendAsString(sb, indentLevel + 1);
			return;
		}

		if (checkEventResponse != null) {
			sb.append("checkEventResponse: ");
			checkEventResponse.appendAsString(sb, indentLevel + 1);
			return;
		}

		if (checkProgressResponse != null) {
			sb.append("checkProgressResponse: ");
			checkProgressResponse.appendAsString(sb, indentLevel + 1);
			return;
		}

		sb.append("<none>");
	}

}

