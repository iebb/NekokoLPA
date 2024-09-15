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

package com.infineon.esim.lpa.core.es9plus.messages.response.base;

import androidx.annotation.NonNull;

public class FunctionExecutionStatus {
    public static final String EXECUTION_STATUS_SUCCESS = "Executed-Success";
    public static final String EXECUTION_STATUS_WITH_WARNING = "Executed-WithWarning";
    public static final String EXECUTION_STATUS_WITH_FAILED = "Failed";
    public static final String EXECUTION_STATUS_WITH_EXPIRED = "Expired";

    private String status;
    private StatusCodeData statusCodeData;

    public FunctionExecutionStatus() {
    }

    public FunctionExecutionStatus(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public StatusCodeData getStatusCodeData() {
        return statusCodeData;
    }

    public void setStatusCodeData(StatusCodeData statusCodeData) {
        this.statusCodeData = statusCodeData;
    }

    public boolean isSuccess() {
        return status.equals(EXECUTION_STATUS_SUCCESS) || status.equals(EXECUTION_STATUS_WITH_WARNING);
    }

    @NonNull
    @Override
    public String toString() {
        return "FunctionExecutionStatus{\n" +
                "  status='" + status + "'\n" +
                "  statusCodeData=" + statusCodeData +
                '}';
    }
}
