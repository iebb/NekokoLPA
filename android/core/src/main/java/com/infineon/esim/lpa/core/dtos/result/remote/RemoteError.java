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

package com.infineon.esim.lpa.core.dtos.result.remote;

import androidx.annotation.NonNull;

import com.infineon.esim.lpa.core.es9plus.messages.response.base.FunctionExecutionStatus;

public class RemoteError {
    private final String status;
    private final String subjectCode;
    private final String reasonCode;
    private final String message;

    public RemoteError() {
        this("No error",null, null, null);
    }

    public RemoteError(FunctionExecutionStatus functionExecutionStatus) {
        if(functionExecutionStatus == null) {
            this.status = "No error";
            this.subjectCode = null;
            this.reasonCode = null;
            this.message = null;
        } else {
            this.status = functionExecutionStatus.getStatus();
            if(functionExecutionStatus.getStatusCodeData() != null) {
                this.subjectCode = functionExecutionStatus.getStatusCodeData().getSubjectCode();
                this.reasonCode = functionExecutionStatus.getStatusCodeData().getReasonCode();
                this.message = functionExecutionStatus.getStatusCodeData().getMessage();
            } else {
                this.subjectCode = null;
                this.reasonCode = null;
                this.message = null;
            }
        }
    }

    public RemoteError(String status, String subjectCode, String reasonCode, String message) {
        this.status = status;
        this.subjectCode = subjectCode;
        this.reasonCode = reasonCode;
        this.message = message;
    }

    public String getStatus() {
        return status;
    }

    public String getSubjectCode() {
        return subjectCode;
    }

    public String getReasonCode() {
        return reasonCode;
    }

    public String getMessage() {
        return message;
    }

    @Override
    @NonNull
    public String toString() {
        return "RspError{" +
                "status='" + status + '\'' +
                ", subjectCode='" + subjectCode + '\'' +
                ", reasonCode='" + reasonCode + '\'' +
                ", message='" + message + '\'' +
                '}';
    }
}
