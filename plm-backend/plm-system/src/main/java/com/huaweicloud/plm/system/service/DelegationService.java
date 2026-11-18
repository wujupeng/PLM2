package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.DelegationQuery;
import com.huaweicloud.plm.system.dto.DelegationSaveRequest;
import com.huaweicloud.plm.system.entity.SysDelegation;
import com.huaweicloud.plm.system.entity.SysUser;
import com.huaweicloud.plm.system.mapper.SysDelegationMapper;
import com.huaweicloud.plm.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
public class DelegationService {

    private static final DateTimeFormatter NO_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    /** 秒内序列，避免同一秒内编号冲突。 */
    private static final AtomicInteger SECOND_SEQUENCE = new AtomicInteger(0);

    private final SysDelegationMapper delegationMapper;
    private final SysUserMapper userMapper;

    public PageResult<SysDelegation> page(DelegationQuery query) {
        Page<SysDelegation> page = query.toPage();
        delegationMapper.selectPage(page, Wrappers.<SysDelegation>lambdaQuery()
                .eq(query.getDelegatorUserId() != null, SysDelegation::getDelegatorUserId, query.getDelegatorUserId())
                .eq(query.getDelegateUserId() != null, SysDelegation::getDelegateUserId, query.getDelegateUserId())
                .eq(StringUtils.hasText(query.getDelegationStatus()),
                        SysDelegation::getDelegationStatus, query.getDelegationStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysDelegation::getDelegationNo, query.getKeyword()).or()
                        .like(SysDelegation::getDelegatorName, query.getKeyword()).or()
                        .like(SysDelegation::getDelegateName, query.getKeyword()))
                .orderByDesc(SysDelegation::getCreatedAt));
        return PageResult.of(page);
    }

    public Long create(DelegationSaveRequest request) {
        SysDelegation delegation = new SysDelegation();
        delegation.setDelegationNo(nextNo());
        applyRequest(delegation, request);
        delegationMapper.insert(delegation);
        return delegation.getId();
    }

    public void update(Long delegationId, DelegationSaveRequest request) {
        SysDelegation delegation = requireDelegation(delegationId);
        applyRequest(delegation, request);
        delegationMapper.updateById(delegation);
    }

    public void delete(Long delegationId) {
        requireDelegation(delegationId);
        delegationMapper.deleteById(delegationId);
    }

    /** 撤回授权：仅生效中的授权可撤回。 */
    public void revoke(Long delegationId) {
        SysDelegation delegation = requireDelegation(delegationId);
        if (!"ACTIVE".equals(delegation.getDelegationStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅生效中的代理授权可撤回");
        }
        delegation.setDelegationStatus("REVOKED");
        delegationMapper.updateById(delegation);
    }

    private SysDelegation requireDelegation(Long delegationId) {
        SysDelegation delegation = delegationMapper.selectById(delegationId);
        if (delegation == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "代理授权不存在: " + delegationId);
        }
        return delegation;
    }

    private void applyRequest(SysDelegation delegation, DelegationSaveRequest request) {
        if (request.getDelegatorUserId().equals(request.getDelegateUserId())) {
            throw new BusinessException("授权人与代理人不能为同一人");
        }
        delegation.setDelegatorUserId(request.getDelegatorUserId());
        delegation.setDelegatorName(resolveDisplayName(request.getDelegatorUserId()));
        delegation.setDelegateUserId(request.getDelegateUserId());
        delegation.setDelegateName(resolveDisplayName(request.getDelegateUserId()));
        delegation.setApplyScope(StringUtils.hasText(request.getApplyScope()) ? request.getApplyScope() : "ALL");
        delegation.setProcessCode("PROCESS".equals(delegation.getApplyScope()) ? request.getProcessCode() : null);
        delegation.setStartAt(request.getStartAt());
        delegation.setEndAt(request.getEndAt());
        delegation.setDelegationStatus(StringUtils.hasText(request.getDelegationStatus())
                ? request.getDelegationStatus() : "ACTIVE");
        delegation.setReason(request.getReason());
        delegation.setRemark(request.getRemark());
    }

    private String resolveDisplayName(Long userId) {
        SysUser user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "用户不存在: " + userId);
        }
        return StringUtils.hasText(user.getDisplayName()) ? user.getDisplayName() : user.getUsername();
    }

    private String nextNo() {
        int seq = SECOND_SEQUENCE.updateAndGet(v -> v >= 999 ? 1 : v + 1);
        return "DLG-" + LocalDateTime.now().format(NO_FORMATTER)
                + String.format("%03d", seq)
                + String.format("%03d", ThreadLocalRandom.current().nextInt(1000));
    }
}
