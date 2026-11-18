package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.system.dto.MailFolderSaveRequest;
import com.huaweicloud.plm.system.entity.OaMailFolder;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MailFolderService;
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

import java.util.List;

@RestController
@RequestMapping("/oa/mail-folders")
@RequiredArgsConstructor
public class OaMailFolderController {

    private final MailFolderService mailFolderService;

    @GetMapping
    @RequirePermission("oa:mail:list")
    public ApiResponse<List<OaMailFolder>> list() {
        return ApiResponse.success(mailFolderService.listForCurrentUser());
    }

    @PostMapping
    @RequirePermission("oa:mail:folder")
    public ApiResponse<Long> create(@Valid @RequestBody MailFolderSaveRequest request) {
        return ApiResponse.success(mailFolderService.create(request));
    }

    @PutMapping("/{folderId}")
    @RequirePermission("oa:mail:folder")
    public ApiResponse<Void> update(@PathVariable Long folderId,
                                    @Valid @RequestBody MailFolderSaveRequest request) {
        mailFolderService.update(folderId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{folderId}")
    @RequirePermission("oa:mail:folder")
    public ApiResponse<Void> delete(@PathVariable Long folderId) {
        mailFolderService.delete(folderId);
        return ApiResponse.success();
    }
}
