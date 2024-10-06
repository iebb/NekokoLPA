package com.infineon.esim.lpa.core.dtos.result.remote;

import com.gsma.sgp.messages.rspdefinitions.ProfileInstallationResultData;
import com.infineon.esim.lpa.core.dtos.ProfileDownloadSession;



public class DownloadException extends RuntimeException
{

    static final String[] ErrorReasons = new String[]{
            "Unknown",
            "incorrectInputValues",
            "invalidSignature",
            "invalidTransactionId",
            "unsupportedCrtValues",
            "unsupportedRemoteOperationType",
            "unsupportedProfileClass",
            "scp03tStructureError",
            "scp03tSecurityError",
            "installFailedDueToIccidAlreadyExistsOnEuicc",
            "installFailedDueToInsufficientMemoryForProfile",
            "installFailedDueToInterruption",
            "installFailedDueToPEProcessingError",
            "installFailedDueToDataMismatch",
            "testProfileInstallFailedDueToInvalidNaaKey",
            "pprNotAllowed",
    };

    private ProfileInstallationResultData result = null;
    private ProfileDownloadSession session = null;
    public int deltaSpace = 0;

    public DownloadException(String message, ProfileInstallationResultData dt)
    {
        super(message);
        this.result = dt;
    }

    public DownloadException(String message, ProfileInstallationResultData dt, ProfileDownloadSession ss)
    {
        super(message);
        this.result = dt;
        this.session = ss;
    }
    public DownloadException(String message, ProfileInstallationResultData dt, ProfileDownloadSession ss, int ds)
    {
        super(message);
        this.result = dt;
        this.session = ss;
        this.deltaSpace = ds;
    }
    public DownloadException(String message, ProfileInstallationResultData dt, Throwable cause)
    {
        super(message, cause);
        this.result = dt;
    }

    public RemoteError getRemoteError() {
        String reason = result.getFinalResult().getErrorResult().getErrorReason().toString();
        int reasonInt = Integer.parseInt(reason);
        if (reasonInt >= ErrorReasons.length) {
            reasonInt = 0;
        }
        return new RemoteError(
                ErrorReasons[reasonInt],
                "code_" + reason,
                "ErrorReason " + reason,
                "message_" + reason
        );
    }

    public ProfileInstallationResultData getResultData() {
        return result;
    }

    public ProfileDownloadSession getSession() {
        return session;
    }

}