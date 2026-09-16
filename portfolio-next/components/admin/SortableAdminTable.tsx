"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export type SortableColumn<T> = {
  header: React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  cell: (item: T) => React.ReactNode;
};

type SortableAdminTableProps<T extends { id: string }> = {
  initialItems: T[];
  columns: SortableColumn<T>[];
  onReorder: (orderedIds: string[]) => Promise<void>;
};

function SortableRow<T extends { id: string }>({
  item,
  columns,
}: {
  item: T;
  columns: SortableColumn<T>[];
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-t border-black/30 bg-border-light"
    >
      <td className="w-12 px-2 py-3 text-white-1">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 hover:bg-white/10 rounded-sm"
          title="Drag to reorder"
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 4h12v1H2V4zm0 3.5h12v1H2v-1zm0 3.5h12v1H2v-1z" />
          </svg>
        </button>
      </td>
      {columns.map((column, index) => (
        <td
          key={index}
          className={column.cellClassName ?? "px-4 py-3"}
        >
          {column.cell(item)}
        </td>
      ))}
    </tr>
  );
}

export default function SortableAdminTable<T extends { id: string }>({
  initialItems,
  columns,
  onReorder,
}: SortableAdminTableProps<T>) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  useEffect(() => {
    savingRef.current = saving;
  }, [saving]);

  useEffect(() => {
    if (!savingRef.current) {
      setItems(initialItems);
    }
  }, [initialItems]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    const previousItems = items;
    const newOrder = arrayMove(items, oldIndex, newIndex);
    setItems(newOrder);

    setSaving(true);
    try {
      await onReorder(newOrder.map((item) => item.id));
      router.refresh();
    } catch (error) {
      console.error("Error saving order:", error);
      setItems(previousItems);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative">
      {saving && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 rounded-lg">
          <span className="text-white">Saving...</span>
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="bg-border-light rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-black/50">
                <tr>
                  <th className="w-12 px-2 py-3 text-left text-white-1 font-normal">
                    <span className="sr-only">Drag</span>
                  </th>
                  {columns.map((column, index) => (
                    <th
                      key={index}
                      className={
                        column.headerClassName ??
                        "px-4 py-3 text-left text-white-1 font-normal"
                      }
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <SortableRow key={item.id} item={item} columns={columns} />
                ))}
              </tbody>
            </table>
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
