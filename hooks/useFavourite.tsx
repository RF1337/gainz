import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const useFavourite = (
  entityType: 'food' | 'item' | 'exercise',
  entityId: string,
  userId: string | null
) => {
  const [isFavourite, setIsFavourite] = useState(false);

  useEffect(() => {
    if (!userId || !entityId) {
      setIsFavourite(false);
      return;
    }

    const checkFavourite = async () => {
      const { data, error } = await supabase
        .from('user_favourites')
        .select('id')
        .eq('user_id', userId)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .maybeSingle();

      if (!error && data) {
        setIsFavourite(true);
      } else {
        setIsFavourite(false);
      }
    };

    checkFavourite();
  }, [entityType, entityId, userId]);

  const toggleFavourite = async () => {
    if (!userId) return;

    if (isFavourite) {
      const { error } = await supabase
        .from('user_favourites')
        .delete()
        .eq('user_id', userId)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId);

      if (!error) setIsFavourite(false);
    } else {
      const { error } = await supabase
        .from('user_favourites')
        .insert({
          user_id: userId,
          entity_type: entityType,
          entity_id: entityId
        });

      if (!error) setIsFavourite(true);
    }
  };

  return { isFavourite, toggleFavourite };
};
