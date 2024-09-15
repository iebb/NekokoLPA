export enum ActionStatus {
  GETTING_EUICC_INFO_STARTED,
  GETTING_EUICC_INFO_FINISHED,
  REFRESHING_EUICC_LIST_STARTED,
  REFRESHING_EUICC_LIST_FINISHED,
  CONNECTING_INTERFACE_STARTED,
  CONNECTING_INTERFACE_CANCELLED,
  CONNECTING_INTERFACE_FINISHED,
  DISCONNECTING_INTERFACE_STARTED,
  DISCONNECTING_INTERFACE_FINISHED,
  OPENING_EUICC_CONNECTION_STARTED,
  OPENING_EUICC_CONNECTION_FINISHED,
  GET_PROFILE_LIST_STARTED,
  GET_PROFILE_LIST_FINISHED,
  ENABLE_PROFILE_STARTED,
  ENABLE_PROFILE_FINISHED,
  DISABLE_PROFILE_STARTED,
  DISABLE_PROFILE_FINISHED,
  DELETE_PROFILE_STARTED,
  DELETE_PROFILE_FINISHED,
  SET_NICKNAME_STARTED,
  SET_NICKNAME_FINISHED,
  AUTHENTICATE_DOWNLOAD_STARTED,
  AUTHENTICATE_DOWNLOAD_FINISHED,
  DOWNLOAD_PROFILE_STARTED,
  DOWNLOAD_PROFILE_FINISHED,
  CANCEL_SESSION_STARTED,
  CANCEL_SESSION_FINISHED,
  CLEAR_ALL_NOTIFICATIONS_STARTED,
  CLEAR_ALL_NOTIFICATIONS_FINISHED,
  REFRESH_PROFILE_LIST
}

export enum CancelSessionReasons {
  END_USER_REJECTION = 0,
  POSTPONED = 1,
  TIMEOUT = 2,
  PPR_NOT_ALLOWED = 3,
  METADATA_MISMATCH = 4,
  LOAD_BPP_EXECUTION_ERROR = 5,
  UNDEFINED = 127,
}