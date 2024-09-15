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

package com.infineon.esim.lpa.core;

import com.infineon.esim.lpa.core.dtos.ActivationCode;
import com.infineon.esim.lpa.core.dtos.EuiccInfo;
import com.infineon.esim.lpa.core.dtos.profile.ProfileMetadata;
import com.infineon.esim.lpa.core.dtos.result.local.ClearNotificationsResult;
import com.infineon.esim.lpa.core.dtos.result.local.DeleteResult;
import com.infineon.esim.lpa.core.dtos.result.local.DisableResult;
import com.infineon.esim.lpa.core.dtos.result.local.EnableResult;
import com.infineon.esim.lpa.core.dtos.result.local.SetNicknameResult;
import com.infineon.esim.lpa.core.dtos.result.remote.AuthenticateResult;
import com.infineon.esim.lpa.core.dtos.result.remote.CancelSessionResult;
import com.infineon.esim.lpa.core.dtos.result.remote.DownloadResult;
import com.infineon.esim.lpa.core.dtos.result.remote.HandleNotificationsResult;
import com.infineon.esim.lpa.core.dtos.result.remote.RemoteError;

import java.util.List;

public interface LocalProfileAssistantCore {
    // Profile management
    String getEID() throws Exception;
    EuiccInfo getEuiccInfo2() throws Exception;
    List<ProfileMetadata> getProfiles() throws Exception;

    // Profile operations
    EnableResult enableProfile(String iccid, boolean refreshFlag) throws Exception;
    DisableResult disableProfile(String iccid) throws Exception;
    DeleteResult deleteProfile(String iccid) throws Exception;
    SetNicknameResult setNickname(String iccid, String nickname) throws Exception;

    // Profile download
    AuthenticateResult authenticate(ActivationCode activationCode) throws Exception;
    DownloadResult downloadProfile(String confirmationCode) throws Exception;
    CancelSessionResult cancelSession(long cancelSessionReasonValue) throws Exception;

    // Notification management
    HandleNotificationsResult handleNotifications() throws Exception;
    ClearNotificationsResult clearPendingNotifications() throws Exception;

    // Get details about last ES9+ error
    RemoteError getLastEs9PlusError();
}