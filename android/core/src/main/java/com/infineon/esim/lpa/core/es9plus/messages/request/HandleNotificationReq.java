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

package com.infineon.esim.lpa.core.es9plus.messages.request;

import androidx.annotation.NonNull;

import com.gsma.sgp.messages.rspdefinitions.HandleNotification;
import com.gsma.sgp.messages.rspdefinitions.PendingNotification;
import com.infineon.esim.messages.Ber;

public class HandleNotificationReq {
    private String pendingNotification;

    public String getPendingNotification() {
        return pendingNotification;
    }

    public void setPendingNotification(String pendingNotification) {
        this.pendingNotification = pendingNotification;
    }

    public HandleNotification getRequest() {
        HandleNotification handleNotification = new HandleNotification();
        handleNotification.setPendingNotification(getPendingNotificationParsed());

        return handleNotification;
    }

    public void setRequest(HandleNotification handleNotification) {
        setPendingNotificationParsed(handleNotification.getPendingNotification());
    }

    public void setRequest(PendingNotification pendingNotification) {
        setPendingNotificationParsed(pendingNotification);
    }

    private PendingNotification getPendingNotificationParsed() {
        return Ber.createFromEncodedBase64String(PendingNotification.class, pendingNotification);
    }

    private void setPendingNotificationParsed(PendingNotification pendingNotificationParsed) {
        pendingNotification = Ber.getEncodedAsBase64String(pendingNotificationParsed);
    }

    @NonNull
    @Override
    public String toString() {
        return "HandleNotificationReq{" +
                "pendingNotification='" + pendingNotification + '\'' +
                '}';
    }
}
