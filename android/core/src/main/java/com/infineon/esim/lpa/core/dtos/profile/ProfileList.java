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
package com.infineon.esim.lpa.core.dtos.profile;

import androidx.annotation.NonNull;

import com.infineon.esim.util.Log;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;


final public class ProfileList {
    private static final String TAG = ProfileList.class.getName();

    private final List<ProfileMetadata> selectedProfile;
    private final List<ProfileMetadata> availableProfiles;


    public ProfileList(List<ProfileMetadata> profileMetadataList) {
        this.selectedProfile = new ArrayList<>();
        this.availableProfiles = new ArrayList<>();

        for(ProfileMetadata profileMetadata : profileMetadataList) {
            addProfile(profileMetadata);
        }
    }

    public String getUniqueNickname(ProfileMetadata profileMetadata) {
        String newNickname = profileMetadata.getProvider();

        int count = 0;
        while(doesNicknameExist(newNickname)) {
            Log.debug(TAG, "Profile nickname is a duplicate: " + newNickname);
            newNickname = String.format(Locale.US, "%s %d", newNickname, count);
        }

        return newNickname;
    }

    private void addProfile(ProfileMetadata profileMetadata) {
        Log.verbose(TAG, "Adding a profile to the list: " + profileMetadata);

        if(profileMetadata.isEnabled()) {
            selectedProfile.add(profileMetadata);
        } else {
            availableProfiles.add(profileMetadata);
        }
    }

    private boolean doesNicknameExist(String nickname) {
        for(ProfileMetadata profile : selectedProfile) {
            if(profile.hasNickname() && profile.getNickname().equals(nickname)) {
                return true;
            }
        }
        for(ProfileMetadata profile : availableProfiles) {
            if(profile.hasNickname() && profile.getNickname().equals(nickname)) {
                return true;
            }
        }
        return false;
    }

    public List<ProfileMetadata> getEnabledProfile() {
        return selectedProfile;
    }

    public List<ProfileMetadata> getDisabledProfiles() {
        return availableProfiles;
    }

    public ProfileMetadata findMatchingProfile(String iccid) {
        for (int i = 0; i < selectedProfile.size(); i++) {
            ProfileMetadata profile = selectedProfile.get(i);
            if (profile.getIccid().equals(iccid)) {
                return profile;
            }
        }
        for (int i = 0; i < availableProfiles.size(); i++) {
            ProfileMetadata profile = availableProfiles.get(i);
            if (profile.getIccid().equals(iccid)) {
                return profile;
            }
        }
        return null;
    }

    @NonNull
    public String toString() {
        StringBuilder sb = new StringBuilder();

        sb.append("ProfileList object:\n");

        sb.append("\tSelected profile:\n");
        for(ProfileMetadata profile : this.selectedProfile) {
            sb.append("\tICCID:").append(profile.getIccid()).append("\n");
            sb.append("\tNickname:").append(profile.getNickname()).append("\n");
            sb.append("\tName:").append(profile.getName()).append("\n");
            sb.append("\tProvider:").append(profile.getProvider()).append("\n");
            sb.append("\tState:").append(profile.getState()).append("\n");
        }

        sb.append("\tAvailable profiles:\n");
        for(ProfileMetadata profile : this.availableProfiles) {
            sb.append("\tICCID:").append(profile.getIccid()).append("\n");
            sb.append("\tNickname:").append(profile.getNickname()).append("\n");
            sb.append("\tName:").append(profile.getName()).append("\n");
            sb.append("\tProvider:").append(profile.getProvider()).append("\n");
            sb.append("\tState:").append(profile.getState()).append("\n");
        }

        return sb.toString();
    }

    public ArrayList<String> getStringList() {
        ArrayList<String> stringList = new ArrayList<>();

        for(ProfileMetadata profile : this.availableProfiles) {
            stringList.add("Nickname: " + profile.getNickname() + "\nName: " + profile.getName()+ "\nICCID: " + profile.getIccid() + "\nProvider: " + profile.getProvider());
        }

        return stringList;
    }
}
