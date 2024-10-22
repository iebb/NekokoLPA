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
package com.infineon.esim.util;

import java.io.PrintWriter;
import java.io.StringWriter;

final public class Log {

    static String logs = "";

    // Ref:
    // https://stackoverflow.com/questions/8355632/how-do-you-usually-tag-log-entries-android
    public static String getFileLineNumber() {
        String info = "";
        final StackTraceElement[] ste = Thread.currentThread().getStackTrace();
        for (int i = 0; i < ste.length; i++) {
            if (ste[i].getMethodName().equals("getFileLineNumber")) {
                info = "("+ste[i + 1].getFileName() + ":" + ste[i + 1].getLineNumber()+")";
            }
        }
        return info;
    }

    public static void verbose(final String tag, final String msg) {
        // logs += new java.util.Date().toString() + " [V][" + tag + "] " + msg + "\n";
        // android.util.Log.v(tag, msg);
    }

    public static void debug(final String tag, final String msg) {
        logs += new java.util.Date().toString() + " [D][" + tag + "] " + msg + "\n";
        android.util.Log.i(tag, msg);
    }

    public static void info(final String tag, final String msg) {
        logs += new java.util.Date().toString() + " [I][" + tag + "] " + msg + "\n";
        android.util.Log.i(tag, msg);
    }

    public static void warn(final String tag, final String msg) {
        logs += new java.util.Date().toString() + " [W][" + tag + "] " + msg + "\n";
        android.util.Log.w(tag, msg);
    }

    public static void warn(final String tag, final String msg, final Throwable error) {
        logs += new java.util.Date().toString() + " [W][" + tag + "] " + msg + "\n";
        logs += " >> [Error] " + error.getMessage() + "\n";
        StringWriter sw = new StringWriter();
        error.printStackTrace(new PrintWriter(sw));
        String exceptionAsString = sw.toString();
        logs += " >> [Trace] " + exceptionAsString + "\n\n";
        android.util.Log.w(tag, msg, error);
    }

    public static void error(final String msg) {
        error("", msg);
    }

    public static void error(final String tag, final String msg) {
        logs += new java.util.Date().toString() + " [E][" + tag + "] " + msg + "\n";
        android.util.Log.e(tag, msg);
    }

    public static void error(final String tag, final String msg, final Throwable error) {
        logs += new java.util.Date().toString() + " [E][" + tag + "] " + msg + "\n";
        logs += " >> [Error] " + error.getMessage() + "\n";
        StringWriter sw = new StringWriter();
        error.printStackTrace(new PrintWriter(sw));
        String exceptionAsString = sw.toString();
        logs += " >> [Trace] " + exceptionAsString + "\n\n";
        android.util.Log.e(tag, msg, error);
    }

    public static String getLogs() {
        return logs;
    }
}
