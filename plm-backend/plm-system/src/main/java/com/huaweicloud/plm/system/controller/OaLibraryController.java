package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BizLibraryBookSaveRequest;
import com.huaweicloud.plm.system.dto.BizLibraryBorrowSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaLibraryBook;
import com.huaweicloud.plm.system.entity.OaLibraryBorrow;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaLibraryBookService;
import com.huaweicloud.plm.system.service.OaLibraryBorrowService;
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

import java.util.List;

/**
 * 图书信息管理接口（OA-DEV-082）：图书档案、借阅、归还、续借与逾期提醒。
 */
@RestController
@RequestMapping("/oa/special/library")
@RequiredArgsConstructor
public class OaLibraryController {

    private final OaLibraryBookService bookService;
    private final OaLibraryBorrowService borrowService;

    /** 图书档案分页。 */
    @GetMapping("/books")
    @RequirePermission("oa:library:list")
    public ApiResponse<PageResult<OaLibraryBook>> pageBooks(OaBizFlowQuery query) {
        return ApiResponse.success(bookService.page(query));
    }

    /** 可借图书列表。 */
    @GetMapping("/books/available")
    @RequirePermission("oa:library:list")
    public ApiResponse<List<OaLibraryBook>> listAvailableBooks() {
        return ApiResponse.success(bookService.listAvailable());
    }

    @GetMapping("/books/{id}")
    @RequirePermission("oa:library:list")
    public ApiResponse<OaLibraryBook> bookDetail(@PathVariable Long id) {
        return ApiResponse.success(bookService.detail(id));
    }

    @PostMapping("/books")
    @RequirePermission("oa:library:manage")
    public ApiResponse<Long> createBook(@Valid @RequestBody BizLibraryBookSaveRequest request) {
        return ApiResponse.success(bookService.save(null, request));
    }

    @PutMapping("/books/{id}")
    @RequirePermission("oa:library:manage")
    public ApiResponse<Void> updateBook(@PathVariable Long id, @Valid @RequestBody BizLibraryBookSaveRequest request) {
        bookService.save(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/books/{id}")
    @RequirePermission("oa:library:manage")
    public ApiResponse<Void> deleteBook(@PathVariable Long id) {
        bookService.delete(id);
        return ApiResponse.success();
    }

    /** 借阅记录分页。 */
    @GetMapping("/borrows")
    @RequirePermission("oa:library:list")
    public ApiResponse<PageResult<OaLibraryBorrow>> pageBorrows(OaBizFlowQuery query) {
        return ApiResponse.success(borrowService.page(query, query.getApplicantUserId()));
    }

    /** 逾期提醒列表。 */
    @GetMapping("/borrows/overdue")
    @RequirePermission("oa:library:list")
    public ApiResponse<List<OaLibraryBorrow>> overdueList() {
        return ApiResponse.success(borrowService.overdueList());
    }

    @GetMapping("/borrows/{id}")
    @RequirePermission("oa:library:list")
    public ApiResponse<OaLibraryBorrow> borrowDetail(@PathVariable Long id) {
        return ApiResponse.success(borrowService.detail(id));
    }

    /** 借阅。 */
    @PostMapping("/borrows")
    @RequirePermission("oa:library:apply")
    public ApiResponse<Long> borrow(@Valid @RequestBody BizLibraryBorrowSaveRequest request) {
        return ApiResponse.success(borrowService.borrow(request));
    }

    /** 归还。 */
    @PutMapping("/borrows/{id}/return")
    @RequirePermission("oa:library:apply")
    public ApiResponse<Void> returnBook(@PathVariable Long id) {
        borrowService.returnBook(id);
        return ApiResponse.success();
    }

    /** 续借。 */
    @PutMapping("/borrows/{id}/renew")
    @RequirePermission("oa:library:apply")
    public ApiResponse<Void> renew(@PathVariable Long id) {
        borrowService.renew(id);
        return ApiResponse.success();
    }
}
