using Catalog.API.Models.DTOs;
using Catalog.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Catalog.API.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoryController : ControllerBase
{
   
     private readonly ICategoryService _categoryService;
     private readonly IProductService _productService;

    public CategoryController(ICategoryService categoryService, IProductService productService){
    _categoryService = categoryService;
    _productService = productService;
}

  
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var categories = await _categoryService.GetAllAsync();
        return Ok(categories);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var category = await _categoryService.GetByIdAsync(id);
        if (category == null) return NotFound();
        return Ok(category);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateCategoryDto dto)
    {
        var created = await _categoryService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _categoryService.DeleteAsync(id);
        if (!deleted) return NotFound();
        return Ok(new { message = "Category deleted successfully." });
    }



    [HttpGet("{id:guid}/products")]
  public async Task<IActionResult> GetProductsByCategory(Guid id){
    var products = await _productService.GetByCategoryIdAsync(id);
    return Ok(products);
}
}