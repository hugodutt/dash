        onDelete={() => {
          if (selectedElement) {
            onDeleteFreeElement(selectedElement.id);
            onDeselectElement();
          }
        }}
      />

      {/* Checkbox Sidebar - aparece quando checkbox está selecionado */}
      <CheckboxSidebar
        isVisible={selectedElement?.type === 'checkbox'}
        selectedElementId={selectedElement?.type === 'checkbox' ? selectedElement.id : undefined}
        checkboxStyle={
          selectedElement && selectedElement.type === 'checkbox'
            ? (() => {
                const element = freeElements.find(e => e.id === selectedElement.id) as any;
                return element ? {
                  text: element.text || 'Item da checklist',
                  done: element.done || false,
                  fontSize: element.fontSize || 16,
                  textColor: element.textColor || '#FFFFFF',
                  opacity: element.opacity || 1
                } : {
                  text: 'Item da checklist',
                  done: false,
                  fontSize: 16,
                  textColor: '#FFFFFF',
                  opacity: 1
                };
              })()
            : {
                text: 'Item da checklist',
                done: false,
                fontSize: 16,
                textColor: '#FFFFFF',
                opacity: 1
              }
        }
        onStyleChange={(style) => {
          if (selectedElement && selectedElement.type === 'checkbox') {
            onUpdateSelectedElementStyle(style);
          }
        }}
        onCreateCheckbox={(style) => {
          onCreateCheckboxFromSidebar(style);
        }}
        onDuplicate={() => {
          if (selectedElement) {
            const element = freeElements.find(e => e.id === selectedElement.id);
            if (element) {
              const newElement = {
                ...element,
                id: `${element.type}-${Date.now()}`,
                position: {
                  x: element.position.x + 20,
                  y: element.position.y + 20
                }
              };
              // Aqui você precisaria chamar uma função para adicionar o elemento duplicado
            }
          }
        }}
        onDelete={() => {
          if (selectedElement) {
            onDeleteFreeElement(selectedElement.id);
            onDeselectElement();
          }
        }}
      />

      {/* Zoom Controls */}
      <ZoomControls
        zoom={viewport.zoom}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
        onFitToScreen={fitToScreen}
      />
    </div>
  );
});