/*
 * THE SOURCE CODE AND ITS RELATED DOCUMENTATION IS PROVIDED "AS IS". INFINEON
 * TECHNOLOGIES MAKES NO OTHER WARRANTY OF ANY KIND,WHETHER EXPRESS,IMPLIED OR,
 * STATUTORY AND DISCLAIMS ANY AND ALL IMPLIED WARRANTIES OF MERCHANTABILITY,
 * SATISFACTORY QUALITY, NON INFRINGEMENT AND FITNESS FOR A PARTICULAR PURPOSE.
 *
 * THE SOURCE CODE AND DOCUMENTATION MAY INCLUDE ERRORS. INFINEON TECHNOLOGIES
 * RESERVES THE RIGHT TO INCORPORATE MODIFICATIONS TO THE SOURCE CODE IN LATER
 * REVISIONS OF IT, AND TO MAKE IMPROVEMENTS OR CHANGES IN THE DOCUMENTATION OR
 * THE PRODUCTS OR TECHNOLOGIES DESCRIBED THEREIN AT ANY TIME.
 *
 * INFINEON TECHNOLOGIES SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT OR
 * CONSEQUENTIAL DAMAGE OR LIABILITY ARISING FROM YOUR USE OF THE SOURCE CODE OR
 * ANY DOCUMENTATION, INCLUDING BUT NOT LIMITED TO, LOST REVENUES, DATA OR
 * PROFITS, DAMAGES OF ANY SPECIAL, INCIDENTAL OR CONSEQUENTIAL NATURE, PUNITIVE
 * DAMAGES, LOSS OF PROPERTY OR LOSS OF PROFITS ARISING OUT OF OR IN CONNECTION
 * WITH THIS AGREEMENT, OR BEING UNUSABLE, EVEN IF ADVISED OF THE POSSIBILITY OR
 * PROBABILITY OF SUCH DAMAGES AND WHETHER A CLAIM FOR SUCH DAMAGE IS BASED UPON
 * WARRANTY, CONTRACT, TORT, NEGLIGENCE OR OTHERWISE.
 *
 * (C)Copyright INFINEON TECHNOLOGIES All rights reserved
 */

package com.infineon.esim.lpa.core.dtos;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

public class ActivationCodeTest {

    @ParameterizedTest
    @ValueSource(strings = {
            "LPA:1$SMDP.GSMA.COM$04386-AGYFT-A74Y8-3F815",
            "LPA:1$SMDP.GSMA.COM$04386-AGYFT-A74Y8-3F815$$1",
            "LPA:1$SMDP.GSMA.COM$04386-AGYFT-A74Y8-3F815$1.3.6.1.4.1.31746$1",
            "LPA:1$SMDP.GSMA.COM$04386-AGYFT-A74Y8-3F815$1.3.6.1.4.1.31746",
            //"LPA:1$SMDP.GSMA.COM$$1.3.6.1.4.1.31746", // This case from the GSMA SGP.22 spec is not supported
            "LPA:1$testsmdpplus.infineon.com$0000-0000-0000-0001",
            "LPA:1$testsmdpplus.infineon.com$0000-0000-0000-0001$2.999.10",
            "LPA:1$testsmdpplus.infineon.com$0000-0000-0000-0001$2.999.10$1",
            "LPA:1$testsmdpplus.infineon.com$0000-0000-0000-0001$$1",
            "LPA:1$raspberrypi.fritz.box:4443$0000-0000-0000-0001",
            "LPA:1$raspberrypi.fritz.box:4443$0000-0000-0000-0001$2.999.10",
            "LPA:1$raspberrypi.fritz.box:4443$0000-0000-0000-0001$2.999.10$1",
            "LPA:1$raspberrypi.fritz.box:4443$0000-0000-0000-0001$$1"
    })
    public void validActivationCodes(String barcode) {
        ActivationCode activationCode = new ActivationCode(barcode);

        assertTrue(activationCode.isValid());
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "LPA:2$testsmdpplus.infineon.com$0000-0000-0000-0001",
            "LPA:1$testsmdpplus.infineon.com$0000-0000-0000-0001$$$1",
            "LPA:1$testsmdpplus.infineon.com$",
            "LPA:1$$$",
            "LPA:1$$",
            "$$",
            "LPA:1$testsmdpplus.infineon.com",
            "LPA:2$testsmdpplus.infineon.com:4443$0000-0000-0000-0001",
            "LPA:1$testsmdpplus.infineon.com:4443$0000-0000-0000-0001$$$1",
            "LPA:1$testsmdpplus.infineon.com:4443$",
            "LPA:1$testsmdpplus.infineon.com:4443"
    })
    public void invalidActivationCodes(String barcode) {
        ActivationCode activationCode = new ActivationCode(barcode);

        assertFalse(activationCode.isValid());
    }
}