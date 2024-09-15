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

package com.infineon.esim.lpa.core.dtos.result.local;


import java.util.HashMap;

public class DisableResult implements OperationResult{
    public static final int OK = 0;
    public static final int ICCID_OR_AID_NOT_FOUND = 1;
    public static final int PROFILE_NOT_IN_ENABLED_STATE = 2;
    public static final int DISALLOWED_BY_POLICY = 3;
    public static final int CAT_BUSY = 5;
    public static final int UNDEFINED_ERROR = 127;
    public static final int NONE = 128;

    private static final HashMap<Integer, String> lookup;

    static {
        lookup = new HashMap<>();
        lookup.put(OK,"OK");
        lookup.put(ICCID_OR_AID_NOT_FOUND, "ICCID or AID not found.");
        lookup.put(PROFILE_NOT_IN_ENABLED_STATE, "Profile not in enabled state.");
        lookup.put(DISALLOWED_BY_POLICY, "Disallowed by policy.");
        lookup.put(CAT_BUSY, "CAT busy.");
        lookup.put(UNDEFINED_ERROR, "Undefined error.");
        lookup.put(NONE, "No error code available.");
    }

    private final int value;

    public DisableResult(int result) {
        this.value = result;
    }

    @Override
    public boolean isOk() {
        return value == OK;
    }

    @Override
    public boolean equals(int value) {
        return this.value == value;
    }

    @Override
    public String getDescription() {
        return lookup.get(value);
    }
}
