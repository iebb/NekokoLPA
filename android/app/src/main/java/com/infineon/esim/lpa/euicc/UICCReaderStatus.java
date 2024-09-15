package com.infineon.esim.lpa.euicc;

public class UICCReaderStatus {
    String name;
    Boolean available;

    public UICCReaderStatus(String _name, Boolean _available) {
        name = _name;
        available = _available;
    }
}