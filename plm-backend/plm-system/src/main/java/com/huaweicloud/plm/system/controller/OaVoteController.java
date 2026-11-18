package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.VoteCastRequest;
import com.huaweicloud.plm.system.dto.VoteQuery;
import com.huaweicloud.plm.system.dto.VoteSaveRequest;
import com.huaweicloud.plm.system.entity.OaOaVote;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaVoteService;
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

/**
 * 投票调查接口（OA-DEV-059）：发布、关闭与参与投票，详情同时返回选项列表。
 */
@RestController
@RequestMapping("/oa/votes")
@RequiredArgsConstructor
public class OaVoteController {

    private final OaVoteService voteService;

    @GetMapping
    @RequirePermission("oa:collab:list")
    public ApiResponse<PageResult<OaOaVote>> page(VoteQuery query) {
        return ApiResponse.success(voteService.page(query));
    }

    /** 投票详情：返回投票主体与选项列表。 */
    @GetMapping("/{id}")
    @RequirePermission("oa:collab:list")
    public ApiResponse<OaVoteService.VoteDetail> detail(@PathVariable Long id) {
        return ApiResponse.success(voteService.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:collab:publish")
    public ApiResponse<Long> create(@Valid @RequestBody VoteSaveRequest request) {
        return ApiResponse.success(voteService.create(request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:collab:publish")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody VoteSaveRequest request) {
        voteService.update(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:collab:publish")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        voteService.delete(id);
        return ApiResponse.success();
    }

    @PutMapping("/{id}/publish")
    @RequirePermission("oa:collab:publish")
    public ApiResponse<Void> publish(@PathVariable Long id) {
        voteService.publish(id);
        return ApiResponse.success();
    }

    @PutMapping("/{id}/close")
    @RequirePermission("oa:collab:publish")
    public ApiResponse<Void> close(@PathVariable Long id) {
        voteService.close(id);
        return ApiResponse.success();
    }

    /** 参与投票：提交所选选项编号。 */
    @PostMapping("/{id}/vote")
    @RequirePermission("oa:collab:vote")
    public ApiResponse<Void> castVote(@PathVariable Long id, @RequestBody VoteCastRequest request) {
        voteService.castVote(id, request.getOptionIds());
        return ApiResponse.success();
    }
}
