package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SysGovAsisFindingQuery;
import com.huaweicloud.plm.system.dto.SysGovAsisFindingSaveRequest;
import com.huaweicloud.plm.system.entity.SysGovAsisFinding;
import com.huaweicloud.plm.system.mapper.SysGovAsisFindingMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * 盘点发现（G1-N7 治理中心 T002 现状盘点）：
 * 发现登记、分页查询与删除。发现编号支持人工指定，删除语义为「释放编号」，采用物理删除。
 */
@Service
@RequiredArgsConstructor
public class SysGovAsisFindingService {

    private static final String DEFAULT_FINDING_TYPE = "PAIN_POINT";
    private static final String DEFAULT_SEVERITY = "MEDIUM";
    private static final String DEFAULT_FINDING_STATUS = "OPEN";

    private final SysGovAsisFindingMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询：系统编码/类型/状态精确，编号/标题模糊，按 id 倒序。 */
    public PageResult<SysGovAsisFinding> pageFindings(SysGovAsisFindingQuery query) {
        Page<SysGovAsisFinding> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysGovAsisFinding>lambdaQuery()
                .eq(StringUtils.hasText(query.getSystemCode()),
                        SysGovAsisFinding::getSystemCode, query.getSystemCode())
                .eq(StringUtils.hasText(query.getFindingType()),
                        SysGovAsisFinding::getFindingType, query.getFindingType())
                .eq(StringUtils.hasText(query.getFindingStatus()),
                        SysGovAsisFinding::getFindingStatus, query.getFindingStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysGovAsisFinding::getFindingNo, query.getKeyword()).or()
                        .like(SysGovAsisFinding::getFindingTitle, query.getKeyword()))
                .orderByDesc(SysGovAsisFinding::getId));
        return PageResult.of(page);
    }

    public SysGovAsisFinding detail(Long id) {
        return require(id);
    }

    /** 新增或更新：新增时回填默认类型/严重程度/状态与组织，发现编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysGovAsisFindingSaveRequest request) {
        SysGovAsisFinding entity;
        if (id == null) {
            entity = new SysGovAsisFinding();
            entity.setFindingNo(StringUtils.hasText(request.getFindingNo())
                    ? request.getFindingNo() : flowSupport.nextBizNo("GAF"));
            entity.setFindingType(StringUtils.hasText(request.getFindingType())
                    ? request.getFindingType() : DEFAULT_FINDING_TYPE);
            entity.setSeverity(StringUtils.hasText(request.getSeverity())
                    ? request.getSeverity() : DEFAULT_SEVERITY);
            entity.setFindingStatus(StringUtils.hasText(request.getFindingStatus())
                    ? request.getFindingStatus() : DEFAULT_FINDING_STATUS);
            entity.setOrgId(currentOrgId());
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

    /** 删除：物理删除以释放发现编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SysGovAsisFinding require(Long id) {
        SysGovAsisFinding entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "盘点发现不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空）时覆盖实体对应字段。 */
    private void applyRequest(SysGovAsisFinding entity, SysGovAsisFindingSaveRequest request) {
        if (StringUtils.hasText(request.getFindingNo())) {
            entity.setFindingNo(request.getFindingNo());
        }
        if (StringUtils.hasText(request.getSystemCode())) {
            entity.setSystemCode(request.getSystemCode());
        }
        if (StringUtils.hasText(request.getFindingType())) {
            entity.setFindingType(request.getFindingType());
        }
        if (StringUtils.hasText(request.getFindingTitle())) {
            entity.setFindingTitle(request.getFindingTitle());
        }
        if (StringUtils.hasText(request.getFindingDesc())) {
            entity.setFindingDesc(request.getFindingDesc());
        }
        if (StringUtils.hasText(request.getSeverity())) {
            entity.setSeverity(request.getSeverity());
        }
        if (StringUtils.hasText(request.getSuggestion())) {
            entity.setSuggestion(request.getSuggestion());
        }
        if (StringUtils.hasText(request.getFindingStatus())) {
            entity.setFindingStatus(request.getFindingStatus());
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
