package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SysMdmQualityCheckQuery;
import com.huaweicloud.plm.system.dto.SysMdmQualityCheckSaveRequest;
import com.huaweicloud.plm.system.entity.SysMdmQualityCheck;
import com.huaweicloud.plm.system.mapper.SysMdmQualityCheckMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

/**
 * 主数据平台—质量校验（G1-N8 公共平台底座 WBS T007 主数据平台）：
 * 质量校验登记、分页查询与删除。
 * 校验记录编号支持人工指定，删除语义为「释放编号」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysMdmQualityCheckService {

    private static final String DEFAULT_CHECK_RESULT = "PASS";
    private static final int DEFAULT_SCORE = 100;

    private final SysMdmQualityCheckMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询质量校验：域/结果/校验项精确，编号/主数据编码模糊，按主键倒序。 */
    public PageResult<SysMdmQualityCheck> pageQualityChecks(SysMdmQualityCheckQuery query) {
        Page<SysMdmQualityCheck> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysMdmQualityCheck>lambdaQuery()
                .eq(StringUtils.hasText(query.getDomainCode()),
                        SysMdmQualityCheck::getDomainCode, query.getDomainCode())
                .eq(StringUtils.hasText(query.getCheckResult()),
                        SysMdmQualityCheck::getCheckResult, query.getCheckResult())
                .eq(StringUtils.hasText(query.getCheckItem()),
                        SysMdmQualityCheck::getCheckItem, query.getCheckItem())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysMdmQualityCheck::getCheckNo, query.getKeyword()).or()
                        .like(SysMdmQualityCheck::getMasterCode, query.getKeyword()))
                .orderByDesc(SysMdmQualityCheck::getId));
        return PageResult.of(page);
    }

    public SysMdmQualityCheck detail(Long id) {
        return require(id);
    }

    /** 新增或更新质量校验：新增时回填默认结果/评分、组织与校验时间，编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysMdmQualityCheckSaveRequest request) {
        SysMdmQualityCheck entity;
        if (id == null) {
            entity = new SysMdmQualityCheck();
            entity.setCheckNo(StringUtils.hasText(request.getCheckNo())
                    ? request.getCheckNo() : flowSupport.nextBizNo("MQC"));
            entity.setCheckResult(StringUtils.hasText(request.getCheckResult())
                    ? request.getCheckResult() : DEFAULT_CHECK_RESULT);
            entity.setScore(request.getScore() == null ? DEFAULT_SCORE : request.getScore());
            entity.setOrgId(currentOrgId());
            if (request.getCheckTime() == null) {
                entity.setCheckTime(LocalDateTime.now());
            }
        } else {
            entity = require(id);
        }
        applyRequest(entity, request);
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 删除质量校验：物理删除以释放校验记录编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SysMdmQualityCheck require(Long id) {
        SysMdmQualityCheck entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "主数据质量校验记录不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非 null）时覆盖实体对应字段。 */
    private void applyRequest(SysMdmQualityCheck entity, SysMdmQualityCheckSaveRequest request) {
        if (StringUtils.hasText(request.getCheckNo())) {
            entity.setCheckNo(request.getCheckNo());
        }
        if (StringUtils.hasText(request.getDomainCode())) {
            entity.setDomainCode(request.getDomainCode());
        }
        if (StringUtils.hasText(request.getMasterCode())) {
            entity.setMasterCode(request.getMasterCode());
        }
        if (StringUtils.hasText(request.getCheckItem())) {
            entity.setCheckItem(request.getCheckItem());
        }
        if (StringUtils.hasText(request.getCheckResult())) {
            entity.setCheckResult(request.getCheckResult());
        }
        if (request.getScore() != null) {
            entity.setScore(request.getScore());
        }
        if (StringUtils.hasText(request.getMessage())) {
            entity.setMessage(request.getMessage());
        }
        if (request.getCheckTime() != null) {
            entity.setCheckTime(request.getCheckTime());
        }
        if (StringUtils.hasText(request.getOrgName())) {
            entity.setOrgName(request.getOrgName());
        }
        if (StringUtils.hasText(request.getDescription())) {
            entity.setDescription(request.getDescription());
        }
        if (StringUtils.hasText(request.getRemark())) {
            entity.setRemark(request.getRemark());
        }
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
