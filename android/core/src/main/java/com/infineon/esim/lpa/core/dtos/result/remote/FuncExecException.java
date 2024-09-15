package com.infineon.esim.lpa.core.dtos.result.remote;

import com.infineon.esim.lpa.core.es9plus.messages.response.base.FunctionExecutionStatus;

public class FuncExecException extends RuntimeException
{
    // private static final long serialVersionUID = 5224152764776895846L;

    private FunctionExecutionStatus feStatus = null;

    public FuncExecException(String message, FunctionExecutionStatus re)
    {
        super(message);
        this.feStatus = re;
    }

    public FuncExecException(FunctionExecutionStatus re)
    {
        this.feStatus = re;
    }

    public FuncExecException(String message, FunctionExecutionStatus re, Throwable cause)
    {
        super(message, cause);
        this.feStatus = re;
    }

    public FunctionExecutionStatus getFunctionExecutionStatus() {
        return this.feStatus;
    }

}