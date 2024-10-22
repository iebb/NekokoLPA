/**
 * This class file was automatically generated by asn1bean v1.11.3 (http://www.beanit.com)
 */

package com.gsma.sgp.messages.pkix1implicit88;

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

import com.gsma.sgp.messages.pkix1explicit88.Attribute;
import com.gsma.sgp.messages.pkix1explicit88.CertificateSerialNumber;
import com.gsma.sgp.messages.pkix1explicit88.DirectoryString;
import com.gsma.sgp.messages.pkix1explicit88.Name;
import com.gsma.sgp.messages.pkix1explicit88.ORAddress;
import com.gsma.sgp.messages.pkix1explicit88.RelativeDistinguishedName;

public class SubjectKeyIdentifier extends KeyIdentifier {

	private static final long serialVersionUID = 1L;

	public SubjectKeyIdentifier() {
	}

	public SubjectKeyIdentifier(byte[] value) {
		super(value);
	}

}
