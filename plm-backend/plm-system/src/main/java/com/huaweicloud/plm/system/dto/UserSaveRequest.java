package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class UserSaveRequest {

    @NotBlank(message = "用户名不能为空")
    private String username;

    /** 新建时必填；修改时留空表示不修改密码。 */
    private String password;

    @NotBlank(message = "显示名称不能为空")
    private String displayName;

    private String email;

    private String phone;

    private Long orgId;

    /** 1=启用，0=停用。 */
    private Integer status;

    private List<Long> roleIds;

    private String remark;
}
