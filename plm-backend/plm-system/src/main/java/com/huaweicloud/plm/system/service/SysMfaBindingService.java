package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.IamQuery;
import com.huaweicloud.plm.system.dto.SysMfaBindingSaveRequest;
import com.huaweicloud.plm.system.entity.SysMfaBinding;
import com.huaweicloud.plm.system.mapper.SysMfaBindingMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 多因素认证绑定（G1-N4 公共平台底座—身份与权限增强 WBS T006 统一身份）：
 * MFA 绑定登记、绑定/解绑/停用状态流转与统计。
 * 绑定编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysMfaBindingService {

    private static final String DEFAULT_MFA_TYPE = "TOTP";
    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_BOUND = "BOUND";
    private static final String STATUS_UNBOUND = "UNBOUND";
    private static final String STATUS_DISABLED = "DISABLED";

    private final SysMfaBindingMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询 MFA 绑定：认证方式/绑定状态/用户名精确，关键字匹配编号/用户名，时间区间作用于创建时间。 */
    public PageResult<SysMfaBinding> pageBindings(IamQuery query) {
        Page<SysMfaBinding> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysMfaBinding>lambdaQuery()
                .eq(StringUtils.hasText(query.getMfaType()),
                        SysMfaBinding::getMfaType, query.getMfaType())
                .eq(StringUtils.hasText(query.getBindStatus()),
                        SysMfaBinding::getBindStatus, query.getBindStatus())
                .eq(StringUtils.hasText(query.getUsername()),
                        SysMfaBinding::getUsername, query.getUsername())
                .ge(StringUtils.hasText(query.getStartDate()), SysMfaBinding::getCreatedAt,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysMfaBinding::getCreatedAt,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysMfaBinding::getBindNo, query.getKeyword()).or()
                        .like(SysMfaBinding::getUsername, query.getKeyword()))
                .orderByDesc(SysMfaBinding::getId));
        return PageResult.of(page);
    }

    public SysMfaBinding detail(Long id) {
        return require(id);
    }

    /** 新增或更新 MFA 绑定：新增时回填默认认证方式、绑定状态与校验计数，并回填组织。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysMfaBindingSaveRequest request) {
        SysMfaBinding entity;
        if (id == null) {
            entity = new SysMfaBinding();
            entity.setBindNo(StringUtils.hasText(request.getBindNo())
                    ? request.getBindNo() : flowSupport.nextBizNo("MFA"));
            entity.setMfaType(DEFAULT_MFA_TYPE);
            entity.setBindStatus(STATUS_PENDING);
            entity.setVerifyCount(0);
            entity.setFailCount(0);
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
            if (StringUtils.hasText(request.getBindNo())) {
                entity.setBindNo(request.getBindNo());
            }
        }
        applyRequest(entity, request);
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 绑定：绑定状态置为 BOUND 并记录绑定时间。 */
    @Transactional(rollbackFor = Exception.class)
    public SysMfaBinding bind(Long id) {
        SysMfaBinding entity = require(id);
        entity.setBindStatus(STATUS_BOUND);
        entity.setBindTime(LocalDateTime.now());
        mapper.updateById(entity);
        return entity;
    }

    /** 解绑：绑定状态置为 UNBOUND。 */
    @Transactional(rollbackFor = Exception.class)
    public SysMfaBinding unbind(Long id) {
        return changeBindStatus(id, STATUS_UNBOUND);
    }

    /** 停用：绑定状态置为 DISABLED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysMfaBinding disable(Long id) {
        return changeBindStatus(id, STATUS_DISABLED);
    }

    /** 删除 MFA 绑定：物理删除以释放编码，避免软删除行占用唯一索引导致再次登记冲突。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** MFA 绑定统计：按绑定状态汇总。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("pending", countBy(SysMfaBinding::getBindStatus, STATUS_PENDING));
        result.put("bound", countBy(SysMfaBinding::getBindStatus, STATUS_BOUND));
        result.put("unbound", countBy(SysMfaBinding::getBindStatus, STATUS_UNBOUND));
        result.put("disabled", countBy(SysMfaBinding::getBindStatus, STATUS_DISABLED));
        return result;
    }

    public SysMfaBinding require(Long id) {
        SysMfaBinding entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "多因素认证绑定不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/时间非空）时覆盖实体对应字段。 */
    private void applyRequest(SysMfaBinding entity, SysMfaBindingSaveRequest request) {
        if (request.getUserId() != null) {
            entity.setUserId(request.getUserId());
        }
        if (StringUtils.hasText(request.getUsername())) {
            entity.setUsername(request.getUsername());
        }
        if (StringUtils.hasText(request.getMfaType())) {
            entity.setMfaType(request.getMfaType());
        }
        if (StringUtils.hasText(request.getSecretKey())) {
            entity.setSecretKey(request.getSecretKey());
        }
        if (StringUtils.hasText(request.getKeyVer())) {
            entity.setKeyVer(request.getKeyVer());
        }
        if (StringUtils.hasText(request.getContactPhone())) {
            entity.setContactPhone(request.getContactPhone());
        }
        if (StringUtils.hasText(request.getContactEmail())) {
            entity.setContactEmail(request.getContactEmail());
        }
        if (StringUtils.hasText(request.getBindStatus())) {
            entity.setBindStatus(request.getBindStatus());
        }
        if (request.getBindTime() != null) {
            entity.setBindTime(request.getBindTime());
        }
        if (request.getLastVerifyAt() != null) {
            entity.setLastVerifyAt(request.getLastVerifyAt());
        }
        if (request.getVerifyCount() != null) {
            entity.setVerifyCount(request.getVerifyCount());
        }
        if (request.getFailCount() != null) {
            entity.setFailCount(request.getFailCount());
        }
        if (request.getExpireTime() != null) {
            entity.setExpireTime(request.getExpireTime());
        }
        if (StringUtils.hasText(request.getOrgName())) {
            entity.setOrgName(request.getOrgName());
        }
        if (StringUtils.hasText(request.getRemark())) {
            entity.setRemark(request.getRemark());
        }
    }

    private SysMfaBinding changeBindStatus(Long id, String bindStatus) {
        SysMfaBinding entity = require(id);
        entity.setBindStatus(bindStatus);
        mapper.updateById(entity);
        return entity;
    }

    private Long countBy(SFunction<SysMfaBinding, ?> column, Object value) {
        Long count = mapper.selectCount(Wrappers.<SysMfaBinding>lambdaQuery().eq(column, value));
        return count == null ? 0L : count;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
