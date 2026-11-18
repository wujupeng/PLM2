package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.BizLibraryBookSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaLibraryBook;
import com.huaweicloud.plm.system.mapper.OaLibraryBookMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 图书信息管理（OA-DEV-082）：图书档案维护与可借数量台账。
 */
@Service
@RequiredArgsConstructor
public class OaLibraryBookService {

    private final OaLibraryBookMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<OaLibraryBook> page(OaBizFlowQuery query) {
        Page<OaLibraryBook> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaLibraryBook>lambdaQuery()
                .eq(query.getOrgId() != null, OaLibraryBook::getOrgId, query.getOrgId())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaLibraryBook::getBookCode, query.getKeyword()).or()
                        .like(OaLibraryBook::getBookName, query.getKeyword()).or()
                        .like(OaLibraryBook::getAuthor, query.getKeyword()).or()
                        .like(OaLibraryBook::getIsbn, query.getKeyword()))
                .orderByDesc(OaLibraryBook::getId));
        return PageResult.of(page);
    }

    /** 可借图书列表，供借阅选择。 */
    public List<OaLibraryBook> listAvailable() {
        return mapper.selectList(Wrappers.<OaLibraryBook>lambdaQuery()
                .eq(OaLibraryBook::getStatus, 1)
                .gt(OaLibraryBook::getAvailableQty, 0)
                .orderByAsc(OaLibraryBook::getBookCode));
    }

    public OaLibraryBook detail(Long id) {
        return requireEntity(id);
    }

    @Transactional
    public Long save(Long id, BizLibraryBookSaveRequest request) {
        if (!StringUtils.hasText(request.getBookName())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "图书名称不能为空");
        }
        OaLibraryBook entity;
        if (id == null) {
            entity = new OaLibraryBook();
            entity.setBookCode(StringUtils.hasText(request.getBookCode())
                    ? request.getBookCode() : flowSupport.nextBizNo("BK"));
            entity.setOrgId(currentOrgId());
            int total = request.getTotalQty() == null ? 1 : request.getTotalQty();
            entity.setTotalQty(total);
            entity.setAvailableQty(total);
        } else {
            entity = requireEntity(id);
            if (StringUtils.hasText(request.getBookCode())) {
                entity.setBookCode(request.getBookCode());
            }
            if (request.getTotalQty() != null) {
                int borrowed = (entity.getTotalQty() == null ? 0 : entity.getTotalQty())
                        - (entity.getAvailableQty() == null ? 0 : entity.getAvailableQty());
                int newTotal = request.getTotalQty();
                if (newTotal < borrowed) {
                    throw new BusinessException(ResultCode.BAD_REQUEST, "总数量不能小于已借出数量: " + borrowed);
                }
                entity.setTotalQty(newTotal);
                entity.setAvailableQty(newTotal - borrowed);
            }
        }
        entity.setBookName(request.getBookName());
        entity.setAuthor(request.getAuthor());
        entity.setPublisher(request.getPublisher());
        entity.setIsbn(request.getIsbn());
        entity.setCategory(request.getCategory());
        entity.setPublishDate(request.getPublishDate());
        entity.setLocation(request.getLocation());
        entity.setStatus(request.getStatus() == null ? 1 : request.getStatus());
        entity.setRemark(request.getRemark());
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    @Transactional
    public void delete(Long id) {
        OaLibraryBook entity = requireEntity(id);
        if (entity.getAvailableQty() != null && entity.getTotalQty() != null
                && entity.getAvailableQty() < entity.getTotalQty()) {
            throw new BusinessException(ResultCode.CONFLICT, "存在未归还借阅，不可删除图书");
        }
        mapper.deleteById(id);
    }

    public OaLibraryBook requireEntity(Long id) {
        OaLibraryBook entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "图书不存在: " + id);
        }
        return entity;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
