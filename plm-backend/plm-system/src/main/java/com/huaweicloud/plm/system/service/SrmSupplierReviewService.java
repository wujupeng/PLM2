package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SrmSupplierReviewQuery;
import com.huaweicloud.plm.system.dto.SrmSupplierReviewSaveRequest;
import com.huaweicloud.plm.system.entity.SrmSupplierReview;
import com.huaweicloud.plm.system.mapper.SrmSupplierReviewMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * SRM 供应商管理—供应商年度复审（对应供应商年度复审）：
 * 复审记录登记、分页查询与删除。
 * 复审单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SrmSupplierReviewService {

    private static final String DEFAULT_REVIEW_NO_PREFIX = "RVW";
    private static final String DEFAULT_REVIEW_TYPE = "ANNUAL";
    private static final String DEFAULT_REVIEW_STATUS = "PENDING";

    private final SrmSupplierReviewMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询复审记录：复审类型/复审状态/供应商编码精确，复审单号/供应商编码/供应商名称/复审人模糊，按主键倒序。 */
    public PageResult<SrmSupplierReview> page(SrmSupplierReviewQuery query) {
        Page<SrmSupplierReview> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SrmSupplierReview>lambdaQuery()
                .eq(StringUtils.hasText(query.getReviewType()),
                        SrmSupplierReview::getReviewType, query.getReviewType())
                .eq(StringUtils.hasText(query.getReviewStatus()),
                        SrmSupplierReview::getReviewStatus, query.getReviewStatus())
                .eq(StringUtils.hasText(query.getSupplierCode()),
                        SrmSupplierReview::getSupplierCode, query.getSupplierCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SrmSupplierReview::getReviewNo, query.getKeyword()).or()
                        .like(SrmSupplierReview::getSupplierCode, query.getKeyword()).or()
                        .like(SrmSupplierReview::getSupplierName, query.getKeyword()).or()
                        .like(SrmSupplierReview::getReviewer, query.getKeyword()))
                .orderByDesc(SrmSupplierReview::getId));
        return PageResult.of(page);
    }

    public SrmSupplierReview detail(Long id) {
        return require(id);
    }

    /** 新增或更新复审记录：新增时回填默认复审类型/复审状态与组织，复审单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SrmSupplierReviewSaveRequest request) {
        SrmSupplierReview entity;
        if (id == null) {
            entity = new SrmSupplierReview();
            entity.setReviewNo(StringUtils.hasText(request.getReviewNo())
                    ? request.getReviewNo() : flowSupport.nextBizNo(DEFAULT_REVIEW_NO_PREFIX));
            entity.setReviewType(StringUtils.hasText(request.getReviewType())
                    ? request.getReviewType() : DEFAULT_REVIEW_TYPE);
            entity.setReviewStatus(StringUtils.hasText(request.getReviewStatus())
                    ? request.getReviewStatus() : DEFAULT_REVIEW_STATUS);
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

    /** 删除复审记录：物理删除以释放复审单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SrmSupplierReview require(Long id) {
        SrmSupplierReview entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "供应商复审记录不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(SrmSupplierReview entity, SrmSupplierReviewSaveRequest request) {
        if (StringUtils.hasText(request.getReviewNo())) {
            entity.setReviewNo(request.getReviewNo());
        }
        if (StringUtils.hasText(request.getSupplierCode())) {
            entity.setSupplierCode(request.getSupplierCode());
        }
        if (StringUtils.hasText(request.getSupplierName())) {
            entity.setSupplierName(request.getSupplierName());
        }
        if (StringUtils.hasText(request.getReviewPeriod())) {
            entity.setReviewPeriod(request.getReviewPeriod());
        }
        if (StringUtils.hasText(request.getReviewType())) {
            entity.setReviewType(request.getReviewType());
        }
        if (StringUtils.hasText(request.getCurrentGrade())) {
            entity.setCurrentGrade(request.getCurrentGrade());
        }
        if (request.getReviewScore() != null) {
            entity.setReviewScore(request.getReviewScore());
        }
        if (StringUtils.hasText(request.getReviewResult())) {
            entity.setReviewResult(request.getReviewResult());
        }
        if (StringUtils.hasText(request.getReviewer())) {
            entity.setReviewer(request.getReviewer());
        }
        if (request.getReviewDate() != null) {
            entity.setReviewDate(request.getReviewDate());
        }
        if (request.getNextReviewDate() != null) {
            entity.setNextReviewDate(request.getNextReviewDate());
        }
        if (StringUtils.hasText(request.getReviewStatus())) {
            entity.setReviewStatus(request.getReviewStatus());
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
