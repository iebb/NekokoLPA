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

import android.graphics.drawable.Icon;
import android.os.Parcel;
import android.os.Parcelable;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.beanit.jasn1.ber.types.BerInteger;
import com.beanit.jasn1.ber.types.BerOctetString;
import com.beanit.jasn1.ber.types.string.BerUTF8String;
import com.gsma.sgp.messages.rspdefinitions.Iccid;
import com.gsma.sgp.messages.rspdefinitions.ProfileInfo;
import com.gsma.sgp.messages.rspdefinitions.ProfileState;
import com.gsma.sgp.messages.rspdefinitions.StoreMetadataRequest;
import com.infineon.esim.lpa.core.es10.definitions.ProfileStates;
import com.infineon.esim.util.Bytes;

import java.util.HashMap;
import java.util.Map;

final public class ProfileMetadata implements Parcelable {
    private static final String TAG = ProfileMetadata.class.getName();

    public static final String STATE_ENABLED = "Enabled";
    public static final String STATE_DISABLED = "Disabled";

    private static final String ICCID = "ICCID";
    private static final String uICCID = "uICCID";
    private static final String STATE = "STATE";
    private static final String NAME = "NAME";
    private static final String PROVIDER_NAME = "PROVIDER_NAME";
    private static final String NICKNAME = "NICKNAME";
    private static final String ICON = "ICON";
    private static final String MCC_MNC = "MCC_MNC";
    private static final String PROFILE_SIZE = "PROFILE_SIZE";

    private final Map<String, String> profileMetadataMap;

    static public String formatIccidUserString(@Nullable String iccidRawString) {
        // swap the odd/even characters to form a new string
        // ignoring the second last char
        if (iccidRawString == null) {
            return "";
        }
        int i = 0;
        StringBuilder newText = new StringBuilder();

        while(i < iccidRawString.length() - 1) {
            newText.append(iccidRawString.charAt(i + 1));
            newText.append(iccidRawString.charAt(i));
            i += 2;
        }
        return newText.toString().replaceAll("F", "").stripTrailing();
    }

    static public String formatMccMncUserString(@Nullable String iccidRawString) {
        // swap the odd/even characters to form a new string
        // ignoring the second last char
        if (iccidRawString == null || iccidRawString.length() < 6) {
            return "";
        }
        String newText = String.valueOf(iccidRawString.charAt(1)) +
                iccidRawString.charAt(0) +
                iccidRawString.charAt(3) +
                iccidRawString.charAt(5) +
                iccidRawString.charAt(4) +
                iccidRawString.charAt(2);
        return newText.replaceAll("F", "");
    }

    public ProfileMetadata(Map<String, String> profileMetadataMap) {
        this.profileMetadataMap = new HashMap<>(profileMetadataMap);
    }

    public ProfileMetadata(@NonNull String iccid,
                           @NonNull String profileState,
                           @NonNull String profileName,
                           @NonNull String serviceProviderName,
                           @Nullable String profileNickname,
                           @Nullable String icon,
                           @Nullable Integer profileSize,
                           @Nullable String mcc_mnc) {
        profileMetadataMap = new HashMap<>();
        initialize(iccid, profileState, profileName, serviceProviderName, profileNickname, icon, profileSize, mcc_mnc);
    }

    public ProfileMetadata(@NonNull Iccid iccid,
                           @NonNull ProfileState profileState,
                           @NonNull BerUTF8String profileName,
                           @NonNull BerUTF8String serviceProviderName,
                           @Nullable BerUTF8String profileNickname,
                           @Nullable BerOctetString icon,
                           @Nullable BerInteger profileSize,
                           @Nullable BerOctetString mcc_mnc) {
        profileMetadataMap = new HashMap<>();

        String nicknameString = null;
        String iconString = null;
        String mccMncString = null;
        if(profileNickname != null) {
            nicknameString = profileNickname.toString();
        }
        if(icon != null) {
            iconString = icon.toString();
        }
        if(mcc_mnc != null) {
            mccMncString = mcc_mnc.toString();
        }
        initialize(iccid.toString(),
                ProfileStates.getString(profileState),
                profileName.toString(),
                serviceProviderName.toString(),
                nicknameString,
                iconString,
                profileSize == null ? 0 : profileSize.intValue(),
                mccMncString);
    }

    public ProfileMetadata(@NonNull ProfileInfo profileInfo) {

        this(profileInfo.getIccid(),
                profileInfo.getProfileState(),
                profileInfo.getProfileName(),
                profileInfo.getServiceProviderName(),
                profileInfo.getProfileNickname(),
                profileInfo.getIcon(),
                profileInfo.getProfileSize(),
                null);
        var owner = profileInfo.getProfileOwner();
        if (owner != null) {
            String mccMnc = owner.getMccMnc().toString();
            profileMetadataMap.put(MCC_MNC, mccMnc);
            profileMetadataMap.put("u" + MCC_MNC, formatMccMncUserString(mccMnc));
        }
    }

    public ProfileMetadata(StoreMetadataRequest storeMetadataRequest) {
        this(storeMetadataRequest.getIccid(),
                new ProfileState(0),
                storeMetadataRequest.getProfileName(),
                storeMetadataRequest.getServiceProviderName(),
                null,
                null,
                null,
                null
                );
        var owner = storeMetadataRequest.getProfileOwner();
        if (owner != null) {
            String mccMnc = owner.getMccMnc().toString();
            profileMetadataMap.put(MCC_MNC, mccMnc);
            profileMetadataMap.put("u" + MCC_MNC, formatMccMncUserString(mccMnc));
        }
    }

    private void initialize(
            @NonNull String iccid,
            @NonNull String state,
            @NonNull String name,
            @NonNull String provider,
            @Nullable String nickname,
            @Nullable String icon,
            @Nullable Integer profileSize,
            @Nullable String mcc_mnc
    ) {

        profileMetadataMap.put(NAME, name);
        profileMetadataMap.put(ICCID, iccid);
        profileMetadataMap.put("u" + ICCID, formatIccidUserString(iccid));
        profileMetadataMap.put(STATE, state);
        profileMetadataMap.put(PROVIDER_NAME, provider);
        profileMetadataMap.put(MCC_MNC, mcc_mnc);
        profileMetadataMap.put(PROFILE_SIZE, profileSize != null ? profileSize.toString() : "0");
        profileMetadataMap.put("u" + MCC_MNC, formatMccMncUserString(mcc_mnc));

        if(nickname != null) {
            profileMetadataMap.put(NICKNAME, nickname);
        }
        if(icon != null) {
            profileMetadataMap.put(ICON, icon);
        }
    }

    public Boolean hasNickname() {
        return (getNickname() != null) && (!getNickname().equals(""));
    }

    public void setEnabled(boolean isEnabled) {
        if(isEnabled) {
            profileMetadataMap.replace(STATE, STATE_ENABLED);
        } else {
            profileMetadataMap.replace(STATE, STATE_DISABLED);
        }
    }

    public Boolean isEnabled() {
        return getState().equals(STATE_ENABLED);
    }

    public String getName() {
        return profileMetadataMap.get(NAME);
    }

    public String getIccid() {
        return profileMetadataMap.get(ICCID);
    }

    public String getState() {
        return profileMetadataMap.get(STATE);
    }

    public String getProvider() {
        return profileMetadataMap.get(PROVIDER_NAME);
    }

    public String getNickname() {
        return profileMetadataMap.get(NICKNAME);
    }

    public String getMccMnc() {
        return profileMetadataMap.get(MCC_MNC);
    }

    public String getProfileSize() {
        return profileMetadataMap.get(PROFILE_SIZE);
    }

    private String getIconString() {
        return profileMetadataMap.get(ICON);
    }

    public void setNickname(String nickname) {
        profileMetadataMap.put(NICKNAME, nickname);
    }

    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(Parcel out, int flags) {
        out.writeString(getName());
        out.writeString(getIccid());
        out.writeString(getState());
        out.writeString(getProvider());
        out.writeString(getNickname());
        out.writeString(getIconString());
        out.writeString(getMccMnc());
        // out.writeString(getProfileSize());
    }

    public static final Parcelable.Creator<ProfileMetadata> CREATOR = new Parcelable.Creator<ProfileMetadata>() {
        public ProfileMetadata createFromParcel(Parcel in) {
            return new ProfileMetadata(in);
        }

        public ProfileMetadata[] newArray(int size) {
            return new ProfileMetadata[size];
        }
    };

    private ProfileMetadata(Parcel in) {
        profileMetadataMap = new HashMap<>();
        profileMetadataMap.put(NAME, in.readString());
        profileMetadataMap.put(ICCID, in.readString());
        profileMetadataMap.put("u" + ICCID,  formatIccidUserString(profileMetadataMap.get(ICCID)));
        profileMetadataMap.put(STATE, in.readString());
        profileMetadataMap.put(PROVIDER_NAME, in.readString());
        profileMetadataMap.put(NICKNAME, in.readString());
        profileMetadataMap.put(ICON, in.readString());
        profileMetadataMap.put(MCC_MNC, in.readString());
        profileMetadataMap.put("u" + MCC_MNC,  formatMccMncUserString(profileMetadataMap.get(MCC_MNC)));
        // profileMetadataMap.put(PROFILE_SIZE, in.readString());
    }

    @NonNull
    @Override
    public String toString() {
        return "Profile{" +
                "profileMetadataMap=" + profileMetadataMap +
                '}';
    }

    public Icon getIcon() {
        String iconBytesHex = profileMetadataMap.get(ICON);

        if(iconBytesHex != null) {
            byte[] iconBytes = Bytes.decodeHexString(iconBytesHex);
            return Icon.createWithData(iconBytes, 0, iconBytes.length);
        } else {
            return null;
        }
    }
}
