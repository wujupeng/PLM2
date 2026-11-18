package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 通讯录人员条目。
 */
@Data
public class AddressBookItem {

    private Long userId;

    private String username;

    private String displayName;

    private String email;

    private String phone;

    private String employeeNo;

    private Long orgId;

    private String orgName;

    private String positionName;

    private String employmentType;

    private String employmentStatus;

    private Long managerUserId;

    private String managerName;

    private String workLocation;
}
