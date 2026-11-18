package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MobileExceptionQuery;
import com.huaweicloud.plm.system.dto.MobileExceptionSaveRequest;
import com.huaweicloud.plm.system.entity.SysMobileException;
import com.huaweicloud.plm.system.mapper.SysMobileExceptionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

/**
 * 移动异常队列（G1-N6 公共平台底座—通用能力 WBS T106 移动端与PDA）：
 * 异常入队登记、处理状态流转（处理中/已解决/已忽略）与删除。
 * 异常编号支持人工指定，删除语义为「释放编号」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysMobileExceptionService {

    private static final String STATUS_OPEN = "OPEN";
    private static final String STATUS_HANDLING = "HANDLING";
    private static final String STATUS_RESOLVED = "RESOLVED";
    private static final String STATUS_IGNORED = "IGNORED";
    private static final String DEFAULT_ERROR_TYPE = "SCAN_FAIL";

    private final SysMobileExceptionMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询移动异常：场景编码/异常类型/处理状态精确，编号/条码/异常信息模糊，按编号倒序。 */
    public PageResult<SysMobileException> pageExceptions(MobileExceptionQuery query) {
        Page<SysMobileException> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysMobileException>lambdaQuery()
                .eq(StringUtils.hasText(query.getSceneCode()),
                        SysMobileException::getSceneCode, query.getSceneCode())
                .eq(StringUtils.hasText(query.getErrorType()),
                        SysMobileException::getErrorType, query.getErrorType())
                .eq(StringUtils.hasText(query.getExceptionStatus()),
                        SysMobileException::getExceptionStatus, query.getExceptionStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysMobileException::getExceptionNo, query.getKeyword()).or()
                        .like(SysMobileException::getBarcode, query.getKeyword()).or()
                        .like(SysMobileException::getErrorMessage, query.getKeyword()))
                .orderByDesc(SysMobileException::getId));
        return PageResult.of(page);
    }

    public SysMobileException detail(Long id) {
        return require(id);
    }

    /** 新增或更新移动异常：新增时回填默认异常类型/处理状态与组织，异常编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, MobileExceptionSaveRequest request) {
        SysMobileException entity;
        if (id == null) {
            entity = new SysMobileException();
            entity.setExceptionNo(StringUtils.hasText(request.getExceptionNo())
                    ? request.getExceptionNo() : flowSupport.nextBizNo("MEX"));
            entity.setErrorType(StringUtils.hasText(request.getErrorType())
                    ? request.getErrorType() : DEFAULT_ERROR_TYPE);
            entity.setExceptionStatus(StringUtils.hasText(request.getExceptionStatus())
                    ? request.getExceptionStatus() : STATUS_OPEN);
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

    /**
     * 入队一条移动异常（供扫码等流程在失败时自动创建）。
     * 异常类型为空时默认 SCAN_FAIL，处理状态置为 OPEN。
     */
    @Transactional(rollbackFor = Exception.class)
    public SysMobileException createException(String sceneCode, String barcode, String errorType,
                                              String errorMessage) {
        SysMobileException entity = new SysMobileException();
        entity.setExceptionNo(flowSupport.nextBizNo("MEX"));
        entity.setSceneCode(sceneCode);
        entity.setBarcode(barcode);
        entity.setErrorType(StringUtils.hasText(errorType) ? errorType : DEFAULT_ERROR_TYPE);
        entity.setErrorMessage(errorMessage);
        entity.setExceptionStatus(STATUS_OPEN);
        entity.setOrgId(currentOrgId());
        mapper.insert(entity);
        return entity;
    }

    /** 处理中：处理状态置为 HANDLING，处理人置为当前用户。 */
    @Transactional(rollbackFor = Exception.class)
    public SysMobileException handle(Long id) {
        SysMobileException entity = require(id);
        entity.setExceptionStatus(STATUS_HANDLING);
        entity.setHandlerName(currentUserName());
        mapper.updateById(entity);
        return entity;
    }

    /** 已解决：处理状态置为 RESOLVED，记录处理人、处理时间与处理说明。 */
    @Transactional(rollbackFor = Exception.class)
    public SysMobileException resolve(Long id, String handleNote) {
        SysMobileException entity = require(id);
        entity.setExceptionStatus(STATUS_RESOLVED);
        entity.setHandlerName(currentUserName());
        entity.setHandledTime(LocalDateTime.now());
        if (StringUtils.hasText(handleNote)) {
            entity.setHandleNote(handleNote);
        }
        mapper.updateById(entity);
        return entity;
    }

    /** 已忽略：处理状态置为 IGNORED，记录处理人与处理时间。 */
    @Transactional(rollbackFor = Exception.class)
    public SysMobileException ignore(Long id) {
        SysMobileException entity = require(id);
        entity.setExceptionStatus(STATUS_IGNORED);
        entity.setHandlerName(currentUserName());
        entity.setHandledTime(LocalDateTime.now());
        mapper.updateById(entity);
        return entity;
    }

    /** 删除移动异常：物理删除以释放异常编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SysMobileException require(Long id) {
        SysMobileException entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "移动异常不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非 null）时覆盖实体对应字段。 */
    private void applyRequest(SysMobileException entity, MobileExceptionSaveRequest request) {
        if (StringUtils.hasText(request.getExceptionNo())) {
            entity.setExceptionNo(request.getExceptionNo());
        }
        if (StringUtils.hasText(request.getSceneCode())) {
            entity.setSceneCode(request.getSceneCode());
        }
        if (StringUtils.hasText(request.getBarcode())) {
            entity.setBarcode(request.getBarcode());
        }
        if (StringUtils.hasText(request.getErrorType())) {
            entity.setErrorType(request.getErrorType());
        }
        if (StringUtils.hasText(request.getErrorMessage())) {
            entity.setErrorMessage(request.getErrorMessage());
        }
        if (StringUtils.hasText(request.getExceptionStatus())) {
            entity.setExceptionStatus(request.getExceptionStatus());
        }
        if (StringUtils.hasText(request.getHandlerName())) {
            entity.setHandlerName(request.getHandlerName());
        }
        if (request.getHandledTime() != null) {
            entity.setHandledTime(request.getHandledTime());
        }
        if (StringUtils.hasText(request.getHandleNote())) {
            entity.setHandleNote(request.getHandleNote());
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

    /** 当前用户名称：优先展示名，缺失时回退登录名。 */
    private String currentUserName() {
        UserContext.Principal principal = UserContext.get();
        if (principal == null) {
            return null;
        }
        return StringUtils.hasText(principal.displayName()) ? principal.displayName() : principal.username();
    }
}
