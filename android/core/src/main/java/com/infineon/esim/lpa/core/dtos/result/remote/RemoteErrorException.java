package com.infineon.esim.lpa.core.dtos.result.remote;

public class RemoteErrorException extends RuntimeException
{
    // private static final long serialVersionUID = 5224152764776895846L;

    private RemoteError err = null;

    public RemoteErrorException(String message, RemoteError re)
    {
        super(message);
        this.err = re;
    }

    public RemoteErrorException(RemoteError re)
    {
        this.err = re;
    }

    public RemoteErrorException(String message, RemoteError re, Throwable cause)
    {
        super(message, cause);
        this.err = re;
    }

}