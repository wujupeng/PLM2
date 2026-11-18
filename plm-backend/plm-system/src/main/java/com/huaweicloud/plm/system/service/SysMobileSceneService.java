package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MobileSceneQuery;
import com.huaweicloud.plm.system.dto.MobileSceneSaveRequest;
import com.huaweicloud.plm.system.entity.SysMobileScene;
import com.huaweicloud.plm.system.mapper.SysMobileSceneMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * 移动场景（G1-N6 公共平台底座—通用能力 WBS T106 移动端与PDA）：
 * 场景登记、分页查询与删除。
 * 场景编号支持人工指定，删除语义为「释放编号」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysMobileSceneService {

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String DEFAULT_SCAN_TYPE = "RECEIVE";
    private static final int DEFAULT_REQUIRE_OFFLINE = 0;
    private static final int DEFAULT_SORT_NO = 1;

    private final SysMobileSceneMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询场景：扫码类型/状态/业务模块精确，编号/编码/名称模糊，按排序号升序。 */
    public PageResult<SysMobileScene> pageScenes(MobileSceneQuery query) {
        Page<SysMobileScene> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysMobileScene>lambdaQuery()
                .eq(StringUtils.hasText(query.getScanType()),
                        SysMobileScene::getScanType, query.getScanType())
                .eq(StringUtils.hasText(query.getSceneStatus()),
                        SysMobileScene::getSceneStatus, query.getSceneStatus())
                .eq(StringUtils.hasText(query.getBizModule()),
                        SysMobileScene::getBizModule, query.getBizModule())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysMobileScene::getSceneNo, query.getKeyword()).or()
                        .like(SysMobileScene::getSceneCode, query.getKeyword()).or()
                        .like(SysMobileScene::getSceneName, query.getKeyword()))
                .orderByAsc(SysMobileScene::getSortNo)
                .orderByDesc(SysMobileScene::getId));
        return PageResult.of(page);
    }

    public SysMobileScene detail(Long id) {
        return require(id);
    }

    /** 新增或更新场景：新增时回填默认扫码类型/离线标记/排序号/状态与组织，场景编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, MobileSceneSaveRequest request) {
        SysMobileScene entity;
        if (id == null) {
            entity = new SysMobileScene();
            entity.setSceneNo(StringUtils.hasText(request.getSceneNo())
                    ? request.getSceneNo() : flowSupport.nextBizNo("MSC"));
            entity.setScanType(StringUtils.hasText(request.getScanType())
                    ? request.getScanType() : DEFAULT_SCAN_TYPE);
            entity.setRequireOffline(request.getRequireOffline() == null
                    ? DEFAULT_REQUIRE_OFFLINE : request.getRequireOffline());
            entity.setSortNo(request.getSortNo() == null ? DEFAULT_SORT_NO : request.getSortNo());
            entity.setSceneStatus(StringUtils.hasText(request.getSceneStatus())
                    ? request.getSceneStatus() : STATUS_ACTIVE);
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

    /** 删除场景：物理删除以释放场景编号/编码。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SysMobileScene require(Long id) {
        SysMobileScene entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "移动场景不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非 null）时覆盖实体对应字段。 */
    private void applyRequest(SysMobileScene entity, MobileSceneSaveRequest request) {
        if (StringUtils.hasText(request.getSceneNo())) {
            entity.setSceneNo(request.getSceneNo());
        }
        if (StringUtils.hasText(request.getSceneCode())) {
            entity.setSceneCode(request.getSceneCode());
        }
        if (StringUtils.hasText(request.getSceneName())) {
            entity.setSceneName(request.getSceneName());
        }
        if (StringUtils.hasText(request.getScanType())) {
            entity.setScanType(request.getScanType());
        }
        if (StringUtils.hasText(request.getBizModule())) {
            entity.setBizModule(request.getBizModule());
        }
        if (request.getRequireOffline() != null) {
            entity.setRequireOffline(request.getRequireOffline());
        }
        if (request.getSortNo() != null) {
            entity.setSortNo(request.getSortNo());
        }
        if (StringUtils.hasText(request.getSceneStatus())) {
            entity.setSceneStatus(request.getSceneStatus());
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
