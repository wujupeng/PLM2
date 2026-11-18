package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.UserQuery;
import com.huaweicloud.plm.system.dto.UserResponse;
import com.huaweicloud.plm.system.dto.UserSaveRequest;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/system/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @RequirePermission("system:user:list")
    public ApiResponse<PageResult<UserResponse>> page(UserQuery query) {
        return ApiResponse.success(userService.page(query));
    }

    @GetMapping("/{userId}")
    @RequirePermission("system:user:list")
    public ApiResponse<UserResponse> detail(@PathVariable Long userId) {
        return ApiResponse.success(userService.getById(userId));
    }

    @PostMapping
    @RequirePermission("system:user:create")
    public ApiResponse<Long> create(@Valid @RequestBody UserSaveRequest request) {
        return ApiResponse.success(userService.create(request));
    }

    @PutMapping("/{userId}")
    @RequirePermission("system:user:update")
    public ApiResponse<Void> update(@PathVariable Long userId, @Valid @RequestBody UserSaveRequest request) {
        userService.update(userId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{userId}")
    @RequirePermission("system:user:delete")
    public ApiResponse<Void> delete(@PathVariable Long userId) {
        userService.delete(userId);
        return ApiResponse.success();
    }

    @PutMapping("/{userId}/status")
    @RequirePermission("system:user:update")
    public ApiResponse<Void> changeStatus(@PathVariable Long userId, @RequestBody Map<String, Integer> body) {
        userService.changeStatus(userId, body.get("status"));
        return ApiResponse.success();
    }

    @PutMapping("/{userId}/password")
    @RequirePermission("system:user:reset-password")
    public ApiResponse<Void> resetPassword(@PathVariable Long userId, @RequestBody Map<String, String> body) {
        userService.resetPassword(userId, body.get("password"));
        return ApiResponse.success();
    }
}
