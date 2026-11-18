package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.BizLibraryBorrowSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaLibraryBook;
import com.huaweicloud.plm.system.entity.OaLibraryBorrow;
import com.huaweicloud.plm.system.mapper.OaLibraryBookMapper;
import com.huaweicloud.plm.system.mapper.OaLibraryBorrowMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * 图书借阅（OA-DEV-082）：借阅、归还、续借、逾期提醒与查询。
 * 借阅最长天数、逾期提醒天数均为可配置项。
 */
@Service
@RequiredArgsConstructor
public class OaLibraryBorrowService {

    private static final String STATUS_BORROWED = "BORROWED";
    private static final String STATUS_RETURNED = "RETURNED";
    private static final String STATUS_OVERDUE = "OVERDUE";

    private final OaLibraryBorrowMapper mapper;
    private final OaLibraryBookMapper bookMapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<OaLibraryBorrow> page(OaBizFlowQuery query, Long borrowerUserId) {
        Page<OaLibraryBorrow> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaLibraryBorrow>lambdaQuery()
                .eq(borrowerUserId != null, OaLibraryBorrow::getBorrowerUserId, borrowerUserId)
                .eq(query.getOrgId() != null, OaLibraryBorrow::getOrgId, query.getOrgId())
                .eq(StringUtils.hasText(query.getFlowStatus()), OaLibraryBorrow::getBorrowStatus, query.getFlowStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaLibraryBorrow::getBorrowNo, query.getKeyword()).or()
                        .like(OaLibraryBorrow::getBookName, query.getKeyword()).or()
                        .like(OaLibraryBorrow::getBorrowerName, query.getKeyword()))
                .orderByDesc(OaLibraryBorrow::getId));
        return PageResult.of(page);
    }

    public OaLibraryBorrow detail(Long id) {
        return requireEntity(id);
    }

    /** 逾期提醒：未归还且已过应还日期的借阅记录。 */
    public List<OaLibraryBorrow> overdueList() {
        LocalDate today = LocalDate.now();
        List<OaLibraryBorrow> list = mapper.selectList(Wrappers.<OaLibraryBorrow>lambdaQuery()
                .in(OaLibraryBorrow::getBorrowStatus, STATUS_BORROWED, STATUS_OVERDUE)
                .lt(OaLibraryBorrow::getDueDate, today)
                .orderByAsc(OaLibraryBorrow::getDueDate));
        for (OaLibraryBorrow borrow : list) {
            borrow.setOverdueDays((int) ChronoUnit.DAYS.between(borrow.getDueDate(), today));
        }
        return list;
    }

    /** 借阅：扣减可借数量并生成借阅记录。 */
    @Transactional
    public Long borrow(BizLibraryBorrowSaveRequest request) {
        if (request == null || request.getBookId() == null) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "图书不能为空");
        }
        OaLibraryBook book = bookMapper.selectById(request.getBookId());
        if (book == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "图书不存在: " + request.getBookId());
        }
        if (book.getAvailableQty() == null || book.getAvailableQty() <= 0) {
            throw new BusinessException(ResultCode.CONFLICT, "图书无可借数量: " + book.getBookName());
        }
        LocalDate borrowDate = request.getBorrowDate() == null ? LocalDate.now() : request.getBorrowDate();
        int maxDays = flowSupport.configInt("oa.library.borrow.max.days", 30);
        LocalDate dueDate = request.getDueDate() == null ? borrowDate.plusDays(maxDays) : request.getDueDate();
        if (dueDate.isBefore(borrowDate)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "应还日期不能早于借阅日期");
        }
        book.setAvailableQty(book.getAvailableQty() - 1);
        bookMapper.updateById(book);

        OaLibraryBorrow entity = new OaLibraryBorrow();
        entity.setBorrowNo(flowSupport.nextBizNo("LB"));
        entity.setBookId(book.getId());
        entity.setBookCode(book.getBookCode());
        entity.setBookName(book.getBookName());
        entity.setBorrowerUserId(UserContext.getUserId());
        entity.setBorrowerName(currentDisplayName());
        entity.setOrgId(currentOrgId());
        entity.setBorrowDate(borrowDate);
        entity.setDueDate(dueDate);
        entity.setRenewCount(0);
        entity.setBorrowStatus(STATUS_BORROWED);
        entity.setRemark(request.getRemark());
        mapper.insert(entity);
        return entity.getId();
    }

    /** 续借：按配置最长天数顺延应还日期。 */
    @Transactional
    public void renew(Long id) {
        OaLibraryBorrow entity = requireEntity(id);
        if (!STATUS_BORROWED.equals(entity.getBorrowStatus()) && !STATUS_OVERDUE.equals(entity.getBorrowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "当前借阅状态不可续借: " + entity.getBorrowStatus());
        }
        int maxDays = flowSupport.configInt("oa.library.borrow.max.days", 30);
        entity.setDueDate(LocalDate.now().plusDays(maxDays));
        entity.setRenewCount((entity.getRenewCount() == null ? 0 : entity.getRenewCount()) + 1);
        entity.setBorrowStatus(STATUS_BORROWED);
        entity.setOverdueDays(0);
        mapper.updateById(entity);
    }

    /** 归还：回补可借数量并登记归还日期。 */
    @Transactional
    public void returnBook(Long id) {
        OaLibraryBorrow entity = requireEntity(id);
        if (STATUS_RETURNED.equals(entity.getBorrowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "该借阅记录已归还");
        }
        OaLibraryBook book = bookMapper.selectById(entity.getBookId());
        if (book != null) {
            int available = book.getAvailableQty() == null ? 0 : book.getAvailableQty();
            int total = book.getTotalQty() == null ? available : book.getTotalQty();
            book.setAvailableQty(Math.min(available + 1, total));
            bookMapper.updateById(book);
        }
        entity.setReturnDate(LocalDate.now());
        entity.setBorrowStatus(STATUS_RETURNED);
        entity.setOverdueDays(0);
        mapper.updateById(entity);
    }

    public OaLibraryBorrow requireEntity(Long id) {
        OaLibraryBorrow entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "借阅记录不存在: " + id);
        }
        return entity;
    }

    private String currentDisplayName() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.displayName();
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
